from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import json

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app =FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

FORM_SCHEMA = {
    # Personal Info
    "full_name": None,
    "date_of_birth": None,
    "age": None,
    "mobile_number": None,
    "email": None,
    "address": None,
    "city": None,
    "state": None,

    # Employment & Income
    "employment_type": None,   # salaried / self-employed / business
    "employer_name": None,
    "monthly_income": None,
    "income_declaration_consent": None,

    # Loan Details
    "loan_purpose": None,
    "loan_amount_requested": None,
    "preferred_tenure_years": None,

    # Education Details
    "university_name": None,
    "course_name": None,
    "country_of_study": None,
    "course_start_date": None,

    # Consent
    "verbal_consent_given": None,
    "data_processing_consent": None,
    "consent_timestamp": None,
}


SYSTEM_PROMPT = """
You are Priya, a warm and friendly AI loan assistant for Poonawalla Fincorp Education Loans.
You are conducting a VIDEO CALL with the customer to help them apply for an education loan.
Your goal is to collect all required information through natural conversation, then generate a personalized loan offer.

PERSONALITY:
- Warm, empathetic, and patient — like a helpful bank relationship manager
- Never robotic or formal
- Celebrate small wins ("Great, got that!")
- If customer seems confused, simplify and reassure

LANGUAGE RULES:
- Detect the customer's language from their FIRST message
- Respond ENTIRELY in that language throughout the session
- If they switch language mid-call, switch with them
- Supported: English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati

CONVERSATION RULES:
- Ask ONE question at a time — never multiple questions together
- If customer already gave info, never ask again
- If customer makes a mistake and corrects themselves, acknowledge warmly and update
- If customer seems hesitant, reassure them about data safety
- Always confirm important details before moving to next section

CONSENT RULES:
- Before collecting any data, ask for explicit verbal consent
- Say: "Before we begin, I need your consent to collect and process your information for this loan application. Do you agree?"
- Record consent with timestamp
- For income declaration, get explicit verbal consent again

SECTIONS TO COVER IN ORDER:
1. Greeting + consent
2. Personal information (name, DOB, contact)
3. Address details  
4. Employment and income
5. Education and loan details
6. Final confirmation + generate loan offer

OFFER GENERATION:
When all fields are collected, generate a personalized loan offer:
- Calculate eligible amount based on income (max 10x annual income)
- Suggest tenure options (3, 5, 7 years)
- Estimate interest rate (10.5% to 14% based on risk signals)
- Calculate approximate EMI
- Present warmly as "Great news! Based on our conversation..."

RESPONSE FORMAT:
Always respond with this exact JSON:
{
  "message": "your conversational reply in customer's language",
  "form_updates": {
    "field_name": "extracted value or null"
  },
  "language": "detected language code (en/hi/mr/ta/te/bn/gu)",
  "stage": "greeting|consent|personal|address|employment|education|offer|complete",
  "sentiment": "positive|neutral|confused|hesitant",
  "is_complete": false,
  "loan_offer": null
}

When generating loan offer, set loan_offer like this:
{
  "eligible_amount": 1500000,
  "tenure_options": [3, 5, 7],
  "interest_rate": 11.5,
  "emi_for_5_years": 32500,
  "offer_valid_till": "2026-04-30"
}

Only set is_complete to true when offer is generated and customer is satisfied.
"""

def generate_session_id():
    return str(uuid.uuid4())[:8].upper()

def get_timestamp():
    return datetime.now().isoformat()

@app.get("/")
def root():
    return {"status": "Priya is ready!", "version": "2.0"}

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    session_id = generate_session_id()
    form_data = FORM_SCHEMA.copy()
    audit_log = []
    session_start = get_timestamp()

    print(f"[{session_id}] New session started")

    chat = client.chats.create(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT
        )
    )
    
    opening = {
        "session_id": session_id,
        "message": "Namaste! I'm Priya, your loan assistant from Poonawalla Fincorp. I'm here to help you with your education loan application. This will feel like a friendly conversation — no complicated forms! Before we begin, may I have your consent to collect and process your information for this application?",
        "form_updates": {},
        "form_data": form_data,
        "language": "en",
        "stage": "greeting",
        "sentiment": "positive",
        "is_complete": False,
        "loan_offer": None
    }

    audit_log.append({
        "timestamp": get_timestamp(),
        "role": "assistant",
        "message": opening["message"],
        "stage": "greeting"
    })

    await websocket.send_text(json.dumps(opening))

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            customer_message = payload.get("message", "")
            geo_location = payload.get("geo_location", None)
            estimated_age = payload.get("estimated_age", None)

            print(f"[{session_id}] customer: {customer_message}")

            audit_log.append({
                "timestamp": get_timestamp(),
                "role": "customer",
                "message":customer_message,
                "geo_location": geo_location,
                "estimated_age": estimated_age
            })

            context_message = customer_message
            context_message = customer_message
            if estimated_age:
                context_message += f"\n[SYSTEM: Computer vision estimated customer age as {estimated_age} years]"
            if geo_location:
                context_message += f"\n[SYSTEM: Customer geo-location: {geo_location}]"

            response = chat.send_message(context_message)
            raw = response.text.strip()

            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            raw = raw.strip()


            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError:
                parsed = {
                    "message": raw,
                    "form_updates": {},
                    "language": "en",
                    "stage": "unknown",
                    "sentiment": "neutral",
                    "is_complete": False,
                    "loan_offer": None
                }

            if "form_updates" in parsed:
                for field, value in parsed["form_updates"].items():
                    if value is not None and field in form_data:
                        form_data[field] = value
                        # Auto-set consent timestamp
                        if field == "verbal_consent_given" and value:
                            form_data["consent_timestamp"] = get_timestamp()

            fraud_signals = []
            if estimated_age and form_data.get("age"):
                try:
                    declared_age = int(form_data["age"])
                    if abs(estimated_age - declared_age) > 0:
                        fraud_signals.append({
                            "type": "age_mismatch",
                            "declared": declared_age,
                            "estimated": estimated_age
                        })
                except:
                    pass
            
            audit_log.append({
                "timestamp": get_timestamp(),
                "role": "assistant",
                "message": parsed.get("message", ""),
                "stage": parsed.get("stage", ""),
                "form_snapshot": form_data.copy(),
                "fraud_signals": fraud_signals
            })

            response_payload = {
                "session_id": session_id,
                "message": parsed.get("message", ""),
                "form_updates": parsed.get("form_updates", {}),
                "form_data": form_data,
                "language": parsed.get("language", "en"),
                "stage": parsed.get("stage", ""),
                "sentiment": parsed.get("sentiment", "neutral"),
                "is_complete": parsed.get("is_complete", False),
                "loan_offer": parsed.get("loan_offer", None),
                "fraud_signals": fraud_signals,
                "fields_completed": sum(1 for v in form_data.values() if v is not None),
                "total_fields": len(form_data)
            }

            await websocket.send_text(json.dumps(response_payload))

            if parsed.get("is_complete"):
                save_audit_log(session_id, audit_log, form_data, session_start)

    except WebSocketDisconnect:
        print(f"[{session_id}] Client disconnected")
        save_audit_log(session_id, audit_log, form_data, session_start)
    except Exception as e:
        print(f"[{session_id}] Error: {e}")
        await websocket.send_text(json.dumps({
            "message": "I'm sorry, something went wrong. Please try again!",
            "form_updates": {},
            "form_data": form_data,
            "is_complete": False
        }))

def save_audit_log(session_id, audit_log, form_data, session_start):
    """Save complete session audit log to file"""
    os.makedirs("audit_logs", exist_ok=True)
    log_data = {
        "session_id": session_id,
        "session_start": session_start,
        "session_end": get_timestamp(),
        "form_data": form_data,
        "conversation": audit_log,
        "fields_completed": sum(1 for v in form_data.values() if v is not None),
        "total_fields": len(form_data)
    }
    filepath = f"audit_logs/session_{session_id}.json"
    with open(filepath, "w") as f:
        json.dump(log_data, f, indent=2)
    print(f"[{session_id}] Audit log saved to {filepath}")
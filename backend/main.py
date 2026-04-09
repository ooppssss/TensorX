from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app =FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

FORM_SCHEMA = {
    "full_name": None,
    "date_of_birth": None,
    "mobile_number": None,
    "email": None,
    "university": None,
    "course_name": None,
    "country_of_study": None,
    "loan_amount": None,
}

SYSTEM_PROMPT = """
You are Priya, a warm and friendly AI loan assistant for Poonawalla Fincorp Education Loans.
Your job is to have a natural conversation with the customer and collect their information.

RULES:
1. Be warm, friendly and human-like — never robotic
2. Ask ONE question at a time — never bombard the customer
3. If customer speaks in Hindi, Marathi, Tamil, Telugu or any other language — respond in the SAME language
4. If customer makes a mistake or corrects themselves — acknowledge it warmly and update the form
5. Always confirm before moving to next section
6. Never ask for information already provided

After every customer message you MUST respond with a JSON object like this:
{
  "message": "your conversational reply here",
  "form_updates": {
    "field_name": "extracted value or null if not mentioned"
  },
  "language": "detected language code like en, hi, mr, ta, te",
  "is_complete": false
}

Only set is_complete to true when ALL fields are filled and customer has confirmed.
"""

@app.get("/")
def root():
    return {"status": "Priya is Ready"}

@app.Websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    print("Client connected!")

    form_data = FORM_SCHEMA.copy()
    conversation_history = []

    model = genai.GenearativeModel(
        model_name = "gemini-2.0-flash",
        system_instruction = SYSTEM_PROMPT
    )
# Priya 🤖 — Agentic AI Video Call–Based Onboarding

> **TensorX 2026 · Poonawalla Fincorp National AI Hackathon**
> Problem Statement 4 — Agentic AI Video Call–Based Onboarding

---

## What is Priya?

Priya is an AI-powered onboarding agent that replaces traditional loan application forms with a **natural voice conversation**. Instead of filling out complex digital forms, customers simply talk to Priya — she listens, understands, and fills the form automatically in real time.

> *"Speak naturally. We handle the rest."*

---

## Demo

> 📹 Demo video coming soon

**Try it live:**
```
Frontend → http://localhost:5173
Backend  → http://localhost:8000
```

---

## Key Features

| Feature | Description | Status |
|---|---|---|
| 🎙️ **Voice-First Conversation** | Browser mic captures speech, Web Speech API transcribes in real time | ✅ Live |
| 🤖 **AI Auto Form-Fill** | LLM extracts structured data from natural conversation, fills every field | ✅ Live |
| 🌍 **Multilingual Support** | Auto-detects language, responds in EN / HI / MR / TA / TE / BN | ✅ Live |
| ✅ **Consent Management** | Verbal consent captured and timestamped, income declaration separately | ✅ Live |
| ⚠️ **Fraud Signal Detection** | Age mismatch detection between declared age and computer vision estimate | ✅ Live |
| 🏦 **Personalised Loan Offer** | AI generates eligible amount, interest rate, tenure options and EMI | ✅ Live |
| 📋 **Audit Logging** | Full session transcript + form snapshots saved per session | ✅ Live |
| 🔄 **Switchable LLM Provider** | Switch between Groq and Gemini via single `.env` variable | ✅ Live |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER (Browser)                   │
│              Mic + Camera + Screen                      │
└────────────────────────┬────────────────────────────────┘
                         │ WebSocket
┌────────────────────────▼────────────────────────────────┐
│               FRONTEND (React + Tailwind)               │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Voice UI    │  │  Form Panel  │  │  Chat Panel  │  │
│  │  (Mic Btn)   │  │  (Live Fill) │  │  (Messages)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ WebSocket (ws://localhost:8000)
┌────────────────────────▼────────────────────────────────┐
│                BACKEND (FastAPI + Python)                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              LangChain Router                   │    │
│  │   Groq (Llama 3.3 70B)  ←→  Gemini 2.0 Flash  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Form         │  │ Fraud        │  │ Audit        │  │
│  │ Extractor    │  │ Detector     │  │ Logger       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              SQLite Database                     │   │
│  │   Sessions · Form Data · Audit Logs · Offers    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **AI / LLM** | Groq — Llama 3.3 70B | Free tier, ultra-fast inference, multilingual |
| **AI Fallback** | Gemini 2.0 Flash | Switchable via `.env` — one line change |
| **LLM Routing** | LangChain | Provider-agnostic, easy to extend |
| **Backend** | FastAPI + WebSockets | Real-time bidirectional communication |
| **Frontend** | React + Tailwind CSS | Component-based UI, fast iteration |
| **Voice** | Web Speech API | Native browser STT, no external API needed |
| **Database** | SQLite | Zero-setup, stores sessions + audit logs |
| **Fraud / Vision** | MediaPipe + OpenCV | Age estimation from live webcam feed |

---

## Project Structure

```
tenzorx-ps4/
│
├── backend/
│   ├── main.py                  # FastAPI server + WebSocket handler
│   ├── audit_logs/              # Per-session JSON audit logs (auto-created)
│   ├── requirements.txt
│   └── .env                     # API keys (never commit this!)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormPanel.jsx    # Live auto-filling form (left panel)
│   │   │   ├── ChatPanel.jsx    # Priya conversation UI (right panel)
│   │   │   └── VoiceButton.jsx  # Mic button with live transcript
│   │   ├── hooks/
│   │   │   └── useWebSocket.js  # WebSocket connection hook
│   │   └── App.jsx              # Root component + state management
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11 or 3.12
- Node.js 18+
- Chrome or Edge browser (for Web Speech API)
- Groq API key — [Get free key here](https://console.groq.com)
- Gemini API key (optional) — [Get free key here](https://aistudio.google.com/apikey)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/tenzorx-ps4.git
cd tenzorx-ps4
```

---

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac / Linux
# OR
venv\Scripts\activate           # Windows

# Install dependencies
pip install fastapi uvicorn python-dotenv langchain-groq langchain-google-genai langchain-core websockets python-multipart
```

Create your `.env` file inside `/backend`:

```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
LLM_PROVIDER=groq
```

> 💡 Switch `LLM_PROVIDER` to `gemini` anytime to use Gemini instead of Groq.

Start the backend:

```bash
uvicorn main:app --reload
```

You should see:
```
[LLM] Using Groq — llama-3.3-70b-versatile
Uvicorn running on http://127.0.0.1:8000
```

---

### 3. Frontend setup

Open a new terminal tab (keep backend running):

```bash
cd frontend

npm install
npm run dev
```

Open **http://localhost:5173** in Chrome or Edge.

---

## How It Works

### Conversation Flow

```
1. GREETING
   Priya introduces herself and asks for verbal consent

2. CONSENT
   Customer says "yes" → consent timestamped and recorded

3. PERSONAL INFO
   Priya collects name, DOB, age, mobile, email
   → Fields fill automatically on the form as customer speaks

4. ADDRESS
   City, state, full address collected conversationally

5. EMPLOYMENT
   Employment type, employer name, monthly income
   → Income declaration consent captured separately

6. EDUCATION & LOAN
   University, course, country, loan amount, tenure

7. OFFER GENERATION
   AI calculates eligible amount, interest rate, EMI
   → Personalised loan offer appears on the form

8. COMPLETION
   Full audit log saved to audit_logs/session_XXXX.json
```

### Switching LLM Provider

Just change one line in `/backend/.env`:

```env
LLM_PROVIDER=groq    # Uses Llama 3.3 70B (default, fastest)
LLM_PROVIDER=gemini  # Uses Gemini 2.0 Flash
```

Restart the backend — no code changes needed.

---

## Supported Languages

| Language | Code | Status |
|---|---|---|
| English | `en` | ✅ |
| Hindi (हिन्दी) | `hi` | ✅ |
| Marathi (मराठी) | `mr` | ✅ |
| Tamil (தமிழ்) | `ta` | ✅ |
| Telugu (తెలుగు) | `te` | ✅ |
| Bengali (বাংলা) | `bn` | ✅ |
| Gujarati (ગુજરાતી) | `gu` | ✅ |

Priya auto-detects the customer's language from their first message and responds entirely in that language.

---

## Audit Logs

Every session is automatically saved to `backend/audit_logs/session_XXXX.json`:

```json
{
  "session_id": "A1B2C3D4",
  "session_start": "2026-04-15T10:30:00",
  "session_end": "2026-04-15T10:38:42",
  "provider": "groq",
  "form_data": {
    "full_name": "Rahul Sharma",
    "date_of_birth": "12/04/2002",
    "verbal_consent_given": "true",
    "consent_timestamp": "2026-04-15T10:30:15",
    ...
  },
  "conversation": [...],
  "fields_completed": 21,
  "total_fields": 22
}
```

---

## Fraud Detection

Priya flags the following signals during a session:

| Signal | How it works |
|---|---|
| **Age mismatch** | Computer vision estimates age from webcam, compares against declared age. Flags if difference > 8 years |
| **Geo-location** | Browser geo-location captured and stored with session for cross-verification |

Fraud signals are logged in the audit trail and surfaced in the UI with a warning banner.

---

## API Reference

### WebSocket — `ws://localhost:8000/ws/chat`

**Send (Frontend → Backend):**
```json
{
  "message": "Hi, my name is Rahul Sharma",
  "geo_location": { "lat": 18.5204, "lng": 73.8567 },
  "estimated_age": 23
}
```

**Receive (Backend → Frontend):**
```json
{
  "session_id": "A1B2C3D4",
  "message": "Got it Rahul! Can you tell me your date of birth?",
  "form_updates": { "full_name": "Rahul Sharma" },
  "form_data": { ... },
  "language": "en",
  "stage": "personal",
  "sentiment": "positive",
  "is_complete": false,
  "loan_offer": null,
  "fraud_signals": [],
  "fields_completed": 1,
  "total_fields": 22
}
```

### Health check — `GET http://localhost:8000/`
```json
{
  "status": "Priya is ready!",
  "version": "3.0",
  "provider": "groq"
}
```

---

## Roadmap

- [x] Voice-first conversation
- [x] Auto form-fill via LLM
- [x] Multilingual support
- [x] Consent management
- [x] Audit logging
- [x] Loan offer generation
- [x] Fraud signal detection
- [ ] Webcam age estimation (MediaPipe)
- [ ] Geo-location capture
- [ ] Text-to-speech (Priya speaks back)
- [ ] Document upload + OCR (Aadhaar / PAN)
- [ ] Risk scoring model

---

## Team

Built solo for **TensorX 2026** by:

**Nupur Samrit**
B.E. AI & Data Science, SCTR's PICT Pune (Batch 2023–2027)

---

## License

MIT License — feel free to use, modify and build on this.

---

> Built with ❤️ for TensorX 2026 · Poonawalla Fincorp National AI Hackathon

import { useState, useEffect } from "react"
import FormPanel from "./components/FormPanel"
import ChatPanel from "./components/ChatPanel"
import useWebSocket from "./hooks/useWebSocket"

const INITIAL_FORM = {
  full_name: null,
  date_of_birth: null,
  age: null,
  mobile_number: null,
  email: null,
  address: null,
  city: null,
  state: null,
  employment_type: null,
  employer_name: null,
  monthly_income: null,
  income_declaration_consent: null,
  loan_purpose: null,
  loan_amount_requested: null,
  preferred_tenure_years: null,
  university_name: null,
  course_name: null,
  country_of_study: null,
  course_start_date: null,
  verbal_consent_given: null,
  data_processing_consent: null,
  consent_timestamp: null,
}

export default function App() {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [messages, setMessages] = useState([])
  const [language, setLanguage] = useState("en")
  const [stage, setStage] = useState("greeting")
  const [loanOffer, setLoanOffer] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [fieldsCompleted, setFieldsCompleted] = useState(0)
  const [totalFields, setTotalFields] = useState(22)
  const [fraudSignals, setFraudSignals] = useState([])

  const { sendMessage, isConnected } = useWebSocket({
    url: "ws://localhost:8000/ws/chat",
    onMessage: (data) => {
      // Add AI message to chat
      if (data.message) {
        setMessages(prev => [...prev, {
          role: "ai",
          text: data.message,
          form_updates: data.form_updates || {},
          timestamp: new Date().toLocaleTimeString()
        }])
      }

      // Update form
      if (data.form_data) setFormData(data.form_data)
      if (data.language) setLanguage(data.language)
      if (data.stage) setStage(data.stage)
      if (data.loan_offer) setLoanOffer(data.loan_offer)
      if (data.session_id) setSessionId(data.session_id)
      if (data.is_complete) setIsComplete(data.is_complete)
      if (data.fields_completed !== undefined) setFieldsCompleted(data.fields_completed)
      if (data.total_fields) setTotalFields(data.total_fields)
      if (data.fraud_signals?.length) setFraudSignals(data.fraud_signals)
    }
  })

  const handleUserMessage = (text) => {
    // Add user message to chat
    setMessages(prev => [...prev, {
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString()
    }])

    // Send to backend
    sendMessage({
      message: text,
      geo_location: null, // we'll add this later
      estimated_age: null  // we'll add this later
    })
  }

  const progressPercent = Math.round((fieldsCompleted / totalFields) * 100)

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[680px] bg-white rounded-2xl shadow-2xl overflow-hidden flex border border-slate-200">

        {/* LEFT — Form */}
        <FormPanel
          formData={formData}
          progressPercent={progressPercent}
          fieldsCompleted={fieldsCompleted}
          totalFields={totalFields}
          loanOffer={loanOffer}
          stage={stage}
          fraudSignals={fraudSignals}
        />

        {/* RIGHT — Chat */}
        <ChatPanel
          messages={messages}
          language={language}
          isConnected={isConnected}
          sessionId={sessionId}
          onSendMessage={handleUserMessage}
          stage={stage}
        />

      </div>
    </div>
  )
}
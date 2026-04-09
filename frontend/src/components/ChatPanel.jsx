import { useState, useRef, useEffect } from "react"
import VoiceButton from "./VoiceButton"

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
]

function Message({ msg }) {
  const isAI = msg.role === "ai"
  const hasUpdates = msg.form_updates && Object.keys(msg.form_updates).length > 0

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed
        ${isAI
          ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
          : "bg-blue-600 text-white rounded-tr-sm"
        }`}
      >
        <p>{msg.text}</p>
        {hasUpdates && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(msg.form_updates)
              .filter(([_, v]) => v)
              .map(([k, v]) => (
                <span key={k} className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                  {k.replace(/_/g, " ")} → {v}
                </span>
              ))
            }
          </div>
        )}
        <p className={`text-[10px] mt-1 ${isAI ? "text-slate-400" : "text-blue-200"}`}>
          {msg.timestamp}
        </p>
      </div>
    </div>
  )
}

export default function ChatPanel({
  messages,
  language,
  isConnected,
  sessionId,
  onSendMessage,
  stage
}) {
  const [inputText, setInputText] = useState("")
  const messagesEndRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!inputText.trim()) return
    onSendMessage(inputText.trim())
    setInputText("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-[400px] flex flex-col bg-slate-50">

      {/* AI Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center
          text-[14px] font-bold text-blue-700 flex-shrink-0">
          {isConnected && (
            <span className="absolute inset-0 rounded-full border-2 border-blue-400
              animate-ping opacity-40" />
          )}
          P
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-slate-800">Priya · AI Loan Assistant</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-slate-300"}`} />
            <span className="text-[11px] text-green-600">
              {isConnected ? "Listening to you..." : "Connecting..."}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {sessionId && (
            <span className="text-[10px] text-slate-400">#{sessionId}</span>
          )}
          <div className="flex items-center gap-1 text-[11px] text-red-500 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Language strip */}
      <div className="flex gap-1.5 px-4 py-2.5 border-b border-slate-200 bg-white overflow-x-auto">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            className={`text-[11px] px-3 py-1 rounded-full border whitespace-nowrap transition-all
              ${language === lang.code
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-[13px] mt-8">
            <p>Connecting to Priya...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice zone */}
      <div className="px-4 pt-3 pb-4 border-t border-slate-200 bg-white space-y-3">
        <VoiceButton
          onTranscript={onSendMessage}
          disabled={!isConnected}
        />
        {/* Text fallback */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">Or type:</span>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Prefer typing? Use this..."
            className="flex-1 px-3 py-2 text-[12px] rounded-full border border-slate-200
              bg-slate-50 outline-none focus:border-blue-300 text-slate-700"
          />
          <button
            onClick={handleSend}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200
              flex items-center justify-center hover:bg-blue-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
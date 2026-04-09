import { useState, useRef, useEffect } from "react"

export default function VoiceButton({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-IN" // India English — works for Hindi too

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      console.log("Heard:", transcript)
      onTranscript(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported. Please use Chrome or Edge.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex items-center justify-center">
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <span className="absolute w-20 h-20 rounded-full bg-blue-100 animate-ping opacity-60" />
            <span className="absolute w-16 h-16 rounded-full bg-blue-200 animate-ping opacity-40" />
          </>
        )}
        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center
            transition-all duration-200 shadow-md active:scale-95
            ${isListening
              ? "bg-red-500 shadow-red-200"
              : "bg-blue-600 shadow-blue-200"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
          `}
        >
          {isListening ? (
            /* Stop icon */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          ) : (
            /* Mic icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="11" rx="3" fill="#fff"/>
              <path d="M5 10v2a7 7 0 0 0 14 0v-2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="12" y2="23" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="8" y1="23" x2="16" y2="23" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
      <p className="text-[12px] text-slate-500 text-center">
        {isListening
          ? <span className="text-red-500 font-medium">Tap to stop · listening...</span>
          : <span><strong className="text-slate-700">Tap to speak</strong> · mic ready</span>
        }
      </p>
    </div>
  )
}
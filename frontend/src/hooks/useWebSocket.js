import { useEffect, useState, useRef, useCallback } from "react";

export default function useWebSocket({url, onMessage}){
    const ws = useRef(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        ws.current = new WebSocket(url)
        
        ws.current.onopen = () =>{
            console.log("WebSocket connected!")
            setIsConnected(true)
        }

        ws.current.onmessage = (event) =>{
            try{
                const data = JSON.parse(event.data)
                onMessage(data)
            }catch(e){
                console.error("Failed to parse message: ", e)
            }
        }

        ws.current.onclose = () => {
            console.log("WebSocket disconnected")
            setIsConnected(false)
        }

        ws.current.onerror = (err) => {
            console.error("WebSocket error: ", err)
        }

        return () => {
            ws.current?.close()
        }
    }, [url])

    const sendMessage = useCallback((payload) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(payload))
        } else {
            console.warn("WebSocket not connected")
        }
    }, [])

  return { sendMessage, isConnected }
}
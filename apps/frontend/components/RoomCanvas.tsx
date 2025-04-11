"use client"
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
import { WS_URL } from "@/config";

export function RoomCanvas({roomId}:{roomId: string}){
    const [socket, setSocket] = useState<WebSocket | null>(null)
    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMGMzMmMxYy04M2M2LTRlNWYtYmI4NC0zYzcyMTU3ZGQ1NDIiLCJpYXQiOjE3MzkwMzY2Mzd9._bsA_LcpgxdFvKzyh9rr4yDsjJtqx4yfwAiPW9bPM3Y`)

        if(!ws) return;

        ws.onopen = () =>{
            setSocket(ws)
            ws.send(JSON.stringify({
                type:"JOIN_ROOM",
                roomId
            }))
        
        }
        
        return () =>{
            ws.close()
        }
            
    },[roomId])
    if(!socket){
        return;

    }
    return <div>
       <Canvas roomId={roomId} socket={socket}/>
    </div>
}
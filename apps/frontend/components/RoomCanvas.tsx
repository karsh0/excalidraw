"use client"

import { InitCanvas } from "@/app/draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
import { WS_URL } from "@/config";

export function RoomCanvas({roomId}:{roomId: string}){
    const [socket, setSocket] = useState<WebSocket | null>(null)
    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDcyNmY2OC1hMjVkLTQ3NjAtOGI2Yy00NWEzNjQ5OGJmZmIiLCJpYXQiOjE3MzkwMjM5NTB9.IqJ45XPwxP09CRx0IKqVkQkAEIs_8XcUCisNP11_6Ac`)

        if(!ws) return;

        ws.onopen = () =>{
            setSocket(socket)
            ws.send(JSON.stringify({
                type:"JOIN_ROOM",
                roomId
            }))
        
        }
            
    },[])


    return <div>
       <Canvas roomId={roomId} socket={socket}/>
    </div>
}
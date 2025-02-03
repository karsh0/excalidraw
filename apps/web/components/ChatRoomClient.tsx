"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../app/hooks/useSocket"
import { ChatRoom } from "./ChatRoom";

export function ChatRoomClient({
    messages,
    id
}:{
    messages: {message: string}[],
    id: string
}){
    const { socket, loading} = useSocket();
    const [chats, setChats] = useState(messages)
    const [currentMessage, setCurrentMessage] = useState<string>('')

    useEffect(()=>{
        if(socket && !loading){

            socket.send(JSON.stringify({
                type: "JOIN_ROOM",
                roomId: id
            }))

            socket.onmessage = (event) =>{
                const parsedData = JSON.parse(event.data);

                if(parsedData.type === "CHAT"){
                    setChats(c => [...c, {message: parsedData.message}])
                }
            }
        }
        return ()=>{
            socket?.close()
        }

    },[socket, loading])


    return <div>
        {chats.map(c => <div>{c.message}</div>)}
        <input type="text" placeholder="Enter message" value={currentMessage} onChange={(e)=> setCurrentMessage(e.target.value)}/>
        <button onClick={()=>{
            socket?.send(JSON.stringify({
                type: "CHAT",
                message: currentMessage,
                roomId: id
            }))
            setCurrentMessage('')
        }}>SEND MESSAGE</button>
    </div>
}
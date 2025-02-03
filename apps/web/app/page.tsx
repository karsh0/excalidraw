"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const [roomId, setRoomId] = useState("")
  const router = useRouter()

  return (
    <div>
      <input type="text" placeholder="Enter roomId" value={roomId} onChange={(e)=> setRoomId(e.target.value)} />
      <button onClick={()=>{
        router.push(`/room/${roomId}`)
      }}>JOIN ROOM</button>
    </div>
  );
}

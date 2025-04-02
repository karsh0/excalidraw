"use client"

import { Game } from "@/app/draw/Game";
import { useEffect, useRef, useState } from "react";

export function Canvas({roomId, socket}:{roomId: string, socket: WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [game, setGame] = useState<Game>()

    useEffect(()=>{            
            if(canvasRef.current){
                const g = new Game(canvasRef.current, roomId, socket)
                setGame(g);
                              
            }

            return()=>{
                game?.destroy()
            }
        },[canvasRef])


    return <div>
        <canvas ref={canvasRef} width={1535} height={695}></canvas>
    </div>
}
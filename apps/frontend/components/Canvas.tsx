"use client"

import { InitCanvas } from "@/app/draw";
import { useEffect, useRef } from "react";

export function Canvas({roomId, socket}:{roomId: string, socket: WebSocket| null}){
 const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(()=>{

        if(canvasRef.current){
            const canvas = canvasRef.current;

            InitCanvas(canvas, roomId, socket)
            
        }

    },[canvasRef])


    return <div>
        <canvas ref={canvasRef} width={1535} height={695}></canvas>
    </div>
}
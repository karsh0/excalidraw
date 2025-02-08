"use client"

import { InitCanvas } from "@/app/draw";
import { useEffect, useRef } from "react";

export function Canvas({roomId, socket}:{roomId: string, socket: WebSocket}){
 const canvasRef = useRef<HTMLCanvasElement>(null)
    useEffect(()=>{
        async function main(){

            
            if(canvasRef.current){
                const canvas = canvasRef.current;
                
                await InitCanvas(canvas, roomId, socket)
                
                console.log(canvasRef.current)
                console.log(await InitCanvas)
            }
        }
        main()
    },[canvasRef])


    return <div>
        <canvas ref={canvasRef} width={1535} height={695}></canvas>
    </div>
}
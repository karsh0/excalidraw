import { useEffect, useState } from "react";
import { WS_URL } from "../config";

export function useSocket(){
    const [loading, setLoading] = useState<boolean>(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDcyNmY2OC1hMjVkLTQ3NjAtOGI2Yy00NWEzNjQ5OGJmZmIiLCJpYXQiOjE3Mzg1ODI2ODl9.W2caDpd5DR3DaTEXgsc53D2DPU7kIXJuNxiCyMplbSI`);
        ws.onopen = () =>{
            setLoading(false)
            setSocket(ws)
        }
    },[])

    return {
        socket,
        loading
    }
}
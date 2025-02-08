import {WebSocket, WebSocketServer} from "ws"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
const wss = new WebSocketServer({port: 8080})

interface User{
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = []

function checkUser(token: string): string | null{
    try{

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if(typeof decoded === "string"){
            return null;
        }
        
        if(!decoded || !decoded.userId){
            return null;
        }
        
        return decoded.userId;
    }catch(e){
        return null;
    }

}

wss.on("connection", (ws, request)=>{

    const url = request.url;
    if(!url){
        return
    }

    const queryParams = new URLSearchParams(url.split('?')[1])
    const token = queryParams.get('token') ?? ""    
    const userId = checkUser(token)

    if(!userId){
        ws.close();
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws
    })

    ws.on("message", (data)=>{
        let parsedData;
        if(typeof parsedData !== "string"){
            parsedData = JSON.parse(data.toString())
        }

        if(parsedData.type === "JOIN_ROOM"){
            const user = users.find(u => u.ws === ws);
            user?.rooms.push(parsedData.roomId)
        }

        if(parsedData.type === "LEAVE_ROOM"){
            const user = users.find(u => u.ws === ws);
            if(!user){
                return;
            }
            user.rooms = user.rooms.filter(x => x !== parsedData.roomId)
        }

        if(parsedData.type === "CHAT"){
            const {roomId, message} = parsedData;

            users.forEach(user =>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"CHAT",
                        message,
                        roomId: Number(roomId)
                    }))
                }
            })
        }
    })
})
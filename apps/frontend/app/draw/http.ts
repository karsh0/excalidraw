import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string){
    const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: any) =>{
        const messageData = JSON.parse(x.message);
        return messageData;
    })
    return shapes
}
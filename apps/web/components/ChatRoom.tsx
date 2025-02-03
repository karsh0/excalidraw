import axios from "axios"
import { BACKEND_URL } from "../app/config"
import { ChatRoomClient } from "./ChatRoomClient"

async function getChats(roomId: string){
    const response = await axios.get(`${BACKEND_URL}/chat/${roomId}`)
    console.log(response.data)
    return response.data.messages
}
export async function ChatRoom({id}:{
    id: string
}){
    const messages = await getChats(id)
    console.log(messages)
    return <ChatRoomClient messages={messages} id={id}></ChatRoomClient>
}
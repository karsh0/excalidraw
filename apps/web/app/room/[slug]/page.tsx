import axios from "axios"
import { BACKEND_URL } from "../../config"
import { ChatRoom } from "../../../components/ChatRoom"

async function getRoom(slug: string){
    console.log("slug: ", slug)
    const response = await axios.get(`${BACKEND_URL}/room/${slug}`)
    return response.data.roomId
}

export default async function ChatRoom1({
    params
}:{
    params:{
        slug: string
    }
}){
    const parsedParams = (await params)
    const slug = parsedParams.slug;
    console.log(slug)
    const roomId = await getRoom(slug)

    return <ChatRoom id={roomId}></ChatRoom>
}
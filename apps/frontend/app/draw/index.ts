import { HTTP_BACKEND } from "@/config"
import axios from "axios"

type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
 } | {
    type:"circle",
    centerX: number,
    centerY: number,
    radius: number
 }


export async function InitCanvas(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket){
    const ctx = canvas.getContext("2d")

    let existingShapes: Shape[] = await getExistingShapes(roomId)
    
    if(!ctx) return;
    
    clearCanvas(existingShapes, canvas, ctx)
    console.log(existingShapes)

    if(!socket) {
        return;
    };

    socket.onmessage = (ev) =>{
        const message = JSON.parse(ev.data)

        if(message.type == "CHAT"){
            const parsedShape = JSON.parse(message.message)
            existingShapes.push(parsedShape)
            clearCanvas(existingShapes, canvas, ctx)
        }

    }

    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let clicked = false;
    let startX = 0;
    let startY = 0;
    canvas.addEventListener("mousedown", (e)=>{
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    })
    canvas.addEventListener("mouseup", (e)=>{
        clicked = false;
        const height = e.clientX - startX;
        const width = e.clientY - startY;
        existingShapes.push({
            type:"rect",
            x: startX,
            y: startY,
            width,
            height
        })
        socket.send(JSON.stringify({
            type:"CHAT",
            roomId,
            message: JSON.stringify({
                type:"rect",
                x: startX,
                y: startY,
                width,
                height
            })
        }))
        //Todo: add the messages in db
    })
    canvas.addEventListener("mousemove", (e)=>{
        if(clicked){
            const height = e.clientX - startX;
            const width = e.clientY - startY;
            clearCanvas(existingShapes, canvas, ctx)
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(startX, startY, width, height)
        }
    })
}


function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D){
    ctx.clearRect(0, 0 ,canvas.width ,canvas.height)
    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0, 0 ,canvas.width ,canvas.height)

    existingShapes.map((shape) =>{
        if(shape.type == "rect"){
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }
    })
}

async function getExistingShapes(roomId: string){
    const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: any) =>{
        const messageData = JSON.parse(x.message);
        return messageData;
    })
    console.log(shapes)
    return shapes
}
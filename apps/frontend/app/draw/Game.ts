import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    points: { x: number, y: number }[];
} | {
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
} | {
    type: "arrow";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
} | {
    type: "text";
    x: number;
    y: number;
    text: string;
}

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private endX = 0;
    private endY = 0;
    private selectedTool: Tool = "circle";
    private pencilPoints: { x: number, y: number }[] = [];


    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: "circle" | "pencil" | "rect" | "line" | "arrow" | "text")  {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.restore();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                console.log(message)
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.restore();
            }
        }
    }

    restore() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(255, 255, 255)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.existingShapes.forEach((shape) => {
            this.ctx.strokeStyle = "rgba(0, 0, 0)";
    
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            } else if (shape.type === "pencil") {
                const points = shape.points;
                if (points.length < 2) return;
    
                this.ctx.beginPath();
                for (let i = 0; i < points.length - 1; i++) {
                    const p1 = points[i];
                    const p2 = points[i + 1];
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
    }
    

    mouseDownHandler = (e: any) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
        this.pencilPoints = [{ x: e.offsetX, y: e.offsetY }];

        if(this.selectedTool === "text"){
            this.ctx.font = "48px serif";
            this.ctx.strokeText('hello', this.startX, this.startY)
        }
    }
    mouseUpHandler = (e: any) => {
        this.clicked = false
        this.endX = e.offsetX;
        this.endY = e.offsetY;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        
        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {

            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
            }
        }
        else if (selectedTool === "pencil") {
            shape = {
                type: "pencil",
                points: this.pencilPoints
            }
        }
        else if (selectedTool === "line"){
           this.ctx.beginPath();
           this.ctx.moveTo(this.startX, this.startY);
           this.ctx.lineTo(this.endX, this.endY);
           this.ctx.stroke();
           this.ctx.closePath();
        }
        else if(selectedTool === "arrow"){
            const headlen = 10;
            let dx = this.endX - this.startX;
            let dy = this.endY - this.startY;
            const angle = Math.atan2(dy,dx);
            this.ctx.beginPath()
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(this.endX, this.endY);
            this.ctx.lineTo(this.endX - headlen * Math.cos(angle - Math.PI / 6), this.endY - headlen * Math.sin(angle - Math.PI / 6));
            this.ctx.moveTo(this.endX, this.endY);
            this.ctx.lineTo(this.endX - headlen * Math.cos(angle + Math.PI / 6), this.endY - headlen * Math.sin(angle + Math.PI / 6));
            this.ctx.stroke()
            this.ctx.closePath()
        }
        

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }
    mouseMoveHandler = (e: any) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.restore();
            this.ctx.strokeStyle = "rgba(0,0,0)"
            const selectedTool = this.selectedTool;
            console.log(selectedTool)
            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);   
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            }
            else if(selectedTool === "pencil"){
                const currentX = e.offsetX;
                const currentY = e.offsetY;
                
                this.pencilPoints.push({x: currentX, y: currentY})
                const len = this.pencilPoints.length;
                this.ctx.beginPath();
                if (len > 1) {
                    const prev = this.pencilPoints[len - 2];
                    this.ctx.moveTo(prev.x, prev.y);
                    this.ctx.lineTo(currentX, currentY);
                } else {
                    this.ctx.moveTo(currentX, currentY);
                    this.ctx.lineTo(currentX, currentY);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if(selectedTool === "line"){
                this.endX = e.offsetX;
                this.endY = e.offsetY;
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(this.endX, this.endY);
                this.ctx.stroke();
                this.ctx.closePath();
               
            }
            else if(selectedTool === "arrow"){
                this.endX = e.offsetX;
                this.endY = e.offsetY;
                const headlen = 10;
                let dx = this.endX - this.startX;
                let dy = this.endY - this.startY;
                const angle = Math.atan2(dy,dx);
                this.ctx.beginPath()
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(this.endX, this.endY);
                this.ctx.lineTo(this.endX - headlen * Math.cos(angle - Math.PI / 6), this.endY - headlen * Math.sin(angle - Math.PI / 6));
                this.ctx.moveTo(this.endX, this.endY);
                this.ctx.lineTo(this.endX - headlen * Math.cos(angle + Math.PI / 6), this.endY - headlen * Math.sin(angle + Math.PI / 6));
                this.ctx.stroke()
                this.ctx.closePath()
            }
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    

    }
}
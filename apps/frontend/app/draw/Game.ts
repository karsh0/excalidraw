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
      points: { x: number; y: number }[];
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
};

    export class Game {
        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private existingShapes: Shape[];
        private roomId: string;
        private clicked: boolean;
        private startX = 0;
        private startY = 0;
        private endX = 0;
        private endY = 0;
        private selectedTool: Tool = "circle";
        private pencilPoints: { x: number; y: number }[] = [];
        private dragStart: { x: number; y: number };
        private cameraZoom: number;
        private cameraOffset: { x: number; y: number };

        public socket: WebSocket;

        constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.dragStart = { x: 0, y: 0 };
        this.cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.cameraZoom = 1;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    } 

    destroy() {
      this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
      this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
      this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }
  
    setTool(tool: Tool) {
      this.selectedTool = tool;
    }
  
    async init() {
      this.existingShapes = await getExistingShapes(this.roomId);
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.restore();
    }
  
    initHandlers() {
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === "chat") {
          const parsedShape = JSON.parse(message.message);
          this.existingShapes.push(parsedShape.shape);
          this.restore();
        }
      };
    }
  
    restore() {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
      this.ctx.setTransform(this.cameraZoom,0, 0,this.cameraZoom,this.cameraOffset.x,
        this.cameraOffset.y
      );
    
      this.ctx.clearRect(-5000, -5000, 10000, 10000);
      this.ctx.fillStyle = "#ffffff";
    
      this.existingShapes.forEach((shape) => {
        this.ctx.strokeStyle = "black";
        switch (shape.type) {
          case "rect":
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            break;
          case "circle":
            this.ctx.beginPath();
            this.ctx.arc(shape.centerX,shape.centerY,shape.radius,0,Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
            break;
          case "pencil":
            this.ctx.beginPath();
            const points = shape.points;
            for (let i = 0; i < points.length - 1; i++) {
              this.ctx.moveTo(points[i].x, points[i].y);
              this.ctx.lineTo(points[i + 1].x, points[i + 1].y);
            }
            this.ctx.stroke();
            this.ctx.closePath();
            break;
          case "line":
            this.ctx.beginPath();
            this.ctx.moveTo(shape.startX, shape.startY);
            this.ctx.lineTo(shape.endX, shape.endY);
            this.ctx.stroke();
            this.ctx.closePath();
            break;
          case "arrow":
            const headlen = 10;
            let dx = shape.endX - shape.startX;
            let dy = shape.endY - shape.startY;
            const angle = Math.atan2(dy, dx);
            this.ctx.beginPath();
            this.ctx.moveTo(shape.startX, shape.startY);
            this.ctx.lineTo(shape.endX, shape.endY);
            this.ctx.lineTo(
              shape.endX - headlen * Math.cos(angle - Math.PI / 6),
              shape.endY - headlen * Math.sin(angle - Math.PI / 6)
            );
            this.ctx.moveTo(shape.endX, shape.endY);
            this.ctx.lineTo(
              shape.endX - headlen * Math.cos(angle + Math.PI / 6),
              shape.endY - headlen * Math.sin(angle + Math.PI / 6)
            );
            this.ctx.stroke();
            this.ctx.closePath();
            break;
          case "text":
            this.ctx.font = "24px serif";
            this.ctx.strokeText(shape.text, shape.x, shape.y);
            break;
        }
      });
    }
  
    getTransformedMousePos = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - this.cameraOffset.x) / this.cameraZoom;
      const y = (e.clientY - rect.top - this.cameraOffset.y) / this.cameraZoom;
      return { x, y };
    };
  
    mouseDownHandler = (e: MouseEvent) => {
      this.clicked = true;
      const pos = this.getTransformedMousePos(e);
      this.startX = pos.x;
      this.startY = pos.y;
    
      if (this.selectedTool === "pencil") {
        this.pencilPoints = [pos];
      }
    
      if (this.selectedTool === "text") {
        this.ctx.font = "48px serif";
        this.ctx.strokeText("hello", this.startX, this.startY);
      }
    
      if (this.selectedTool === "drag") {
        const screenPos = { x: e.clientX, y: e.clientY };
        this.dragStart.x = screenPos.x / this.cameraZoom - this.cameraOffset.x;
        this.dragStart.y = screenPos.y / this.cameraZoom - this.cameraOffset.y;
      }
    };
  
    mouseUpHandler = (e: MouseEvent) => {
      this.clicked = false;
      const pos = this.getTransformedMousePos(e);
      this.endX = pos.x;
      this.endY = pos.y;
    
      const width = this.endX - this.startX;
      const height = this.endY - this.startY;
    
      let shape: Shape | null = null;
    
      switch (this.selectedTool) {
        case "rect":
          shape = {
            type: "rect",
            x: this.startX,
            y: this.startY,
            width,
            height,
          };
          break;
        case "circle":
          const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
          shape = {
            type: "circle",
            centerX: this.startX + width / 2,
            centerY: this.startY + height / 2,
            radius,
          };
          break;
        case "pencil":
          shape = {
            type: "pencil",
            points: this.pencilPoints,
          };
          break;
        case "line":
          shape = {
            type: "line",
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY,
          };
          break;
        case "arrow":
          shape = {
            type: "arrow",
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY,
          };
          break;
      }
    
      if (!shape) return;
    
      this.existingShapes.push(shape);
    
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          roomId: this.roomId,
        })
      );
    };
  
    mouseMoveHandler = (e: MouseEvent) => {
      if (!this.clicked) return;
    
      const pos = this.getTransformedMousePos(e);
      this.endX = pos.x;
      this.endY = pos.y;
    
      const width = this.endX - this.startX;
      const height = this.endY - this.startY;
    
      if (this.selectedTool === "drag") {
        const screenPos = { x: e.clientX, y: e.clientY };
        this.cameraOffset.x = screenPos.x / this.cameraZoom - this.dragStart.x;
        this.cameraOffset.y = screenPos.y / this.cameraZoom - this.dragStart.y;
        this.restore();
        return;
      }
    
      this.restore();
      this.ctx.strokeStyle = "black";
    
      switch (this.selectedTool) {
        case "rect":
          this.ctx.strokeRect(this.startX, this.startY, width, height);
          break;
        case "circle":
          const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
          this.ctx.beginPath();
          this.ctx.arc(
            this.startX + width / 2,
            this.startY + height / 2,
            radius,
            0,
            Math.PI * 2
          );
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "pencil":
          this.pencilPoints.push({ x: pos.x, y: pos.y });
          const len = this.pencilPoints.length;
          if (len > 1) {
            const prev = this.pencilPoints[len - 2];
            this.ctx.beginPath();
            this.ctx.moveTo(prev.x, prev.y);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
            this.ctx.closePath();
          }
          break;
        case "line":
          this.ctx.beginPath();
          this.ctx.moveTo(this.startX, this.startY);
          this.ctx.lineTo(this.endX, this.endY);
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "arrow":
          const headlen = 10;
          let dx = this.endX - this.startX;
          let dy = this.endY - this.startY;
          const angle = Math.atan2(dy, dx);
          this.ctx.beginPath();
          this.ctx.moveTo(this.startX, this.startY);
          this.ctx.lineTo(this.endX, this.endY);
          this.ctx.lineTo(
            this.endX - headlen * Math.cos(angle - Math.PI / 6),
            this.endY - headlen * Math.sin(angle - Math.PI / 6)
          );
          this.ctx.moveTo(this.endX, this.endY);
          this.ctx.lineTo(
            this.endX - headlen * Math.cos(angle + Math.PI / 6),
            this.endY - headlen * Math.sin(angle + Math.PI / 6)
          );
          this.ctx.stroke();
          this.ctx.closePath();
          break;
      }
    };
  
    initMouseHandlers() {
      this.canvas.addEventListener("mousedown", this.mouseDownHandler);
      this.canvas.addEventListener("mouseup", this.mouseUpHandler);
      this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}   
    
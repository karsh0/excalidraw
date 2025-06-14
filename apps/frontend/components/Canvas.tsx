import { useEffect, useRef, useState } from "react";
import { Circle, Hand, MoveRight, Pencil, PenLine, RectangleHorizontalIcon, Text } from "lucide-react";
import { Game } from "@/app/draw/Game";
import { IconButton } from "./IconButton";

export type Tool = "circle" | "rect" | "pencil" | "line" | "arrow" | "text" | "drag";

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle")

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {

        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }


    }, [canvasRef]);

    return <div className="w-screen overflow-hidden">
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
}

function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div className="fixed w-fit top-4 left-1/2 -translate-x-1/2 bg-white">
            <div className="flex gap-2 px-2 py-2 bg-white border rounded-xl">
                <IconButton onClick={() => {
                    setSelectedTool("drag")
                }} activated={selectedTool === "drag"} icon={<Hand />}></IconButton>
                <IconButton onClick={() => {
                        setSelectedTool("pencil")
                }} activated={selectedTool === "pencil"} icon={<Pencil />}></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("line")
                }} activated={selectedTool === "line"} icon={<PenLine />}></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("arrow")
                }} activated={selectedTool === "arrow"} icon={<MoveRight />}></IconButton>
                 <IconButton onClick={() => {
                    setSelectedTool("text")
                }} activated={selectedTool === "text"} icon={<Text />}></IconButton>
               
            </div>
        </div>
}
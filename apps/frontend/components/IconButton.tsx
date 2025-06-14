import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`pointer rounded-lg p-2 hover:bg-gray ${activated ? "bg-[#e0dfff]" : "text-white"}`} onClick={onClick}>
        {icon}
    </div>
}

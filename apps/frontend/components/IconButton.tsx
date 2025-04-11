import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`pointer rounded-xl p-2 hover:bg-gray ${activated ? "bg-[#e0dfff]" : "text-white"}`} onClick={onClick}>
        {icon}
    </div>
}

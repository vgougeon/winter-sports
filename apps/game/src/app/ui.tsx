import { useObservable, useRendersCount } from "react-use";
import SoccerUI from "./interface/games/soccer-ui";
import gameService from "./services/game.service";

export function UI() {
    const socketStatus = useObservable(gameService.socketStatus)
    const renders = useRendersCount()
    return (
        <>
        <SoccerUI />
        <span className="absolute text-white top-2 left-2">{ renders }</span>
        <div className={`absolute w-4 h-4 rounded-full top-2 right-2 ${socketStatus ? 'bg-green-500' : 'bg-red-600'}`}></div>
        </>
    )
}

export default UI;
import { useSelector } from "react-redux";
import Score from "../absolute/score";
import KickOff from "./soccer/kickoff";

export default function SoccerUI() {
    const state = useSelector((state: any) => state.game.state)
    console.log("STATE", state)
    return (
        <>
        {state === 'kickoff' && <KickOff />}
        <Score />
        </>
    )
}
import Queue from "./interface/absolute/queue";
import Score from "./interface/absolute/score";
import TitleScreen from "./interface/pages/title-screen";
import Performance from './interface/absolute/performance';
import { useSelector } from "react-redux";

export function UI() {
    const mode = useSelector((state: any) => state.game.mode)
    return (
        <>
            { mode === 'title-screen' && <TitleScreen /> }
            <Queue />
            <Performance />
            <Score />
        </>
    )
}

export default UI;
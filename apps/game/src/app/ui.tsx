import Queue from "./interface/absolute/queue";
import TitleScreen from "./interface/pages/title-screen";
import Performance from './interface/absolute/performance';
import { useSelector } from "react-redux";
import LoginScreen from "./interface/pages/login-screen";
import SoccerUI from "./interface/games/soccer-ui";

export function UI() {
    const mode = useSelector((state: any) => state.game.mode)
    const pseudo = useSelector((state: any) => state.socket.pseudo)
    console.log(mode)
    // if(!pseudo) return <LoginScreen />
    return (
        <>
            {/* {mode === 'title-screen' && <TitleScreen />} */}
            {mode === 'Soccer' && <SoccerUI />}
            <Queue />
            <Performance />
        </>
    )
}

export default UI;
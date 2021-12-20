import { useObservable } from "react-use"
import gameService from "../../services/game.service"
import { Soccer } from '@winter-sports/game-lib';
import { distinctUntilChanged } from "rxjs";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
import { useTimer } from "react-timer-hook";
import { AnimatePresence, motion } from "framer-motion";
dayjs.extend(duration)

export default function SoccerUI() {
    if (gameService.game?.mode instanceof Soccer) {
        const mode = gameService.game?.mode as Soccer
        const currentState = useObservable(mode.ui.currentState)
        return (
            <div className="absolute w-screen h-screen pointer-events-none">
                <Score />
                <AnimatePresence>{currentState === 'KICKOFF' && <KickOff />}</AnimatePresence>
                <AnimatePresence>{currentState === 'GOAL_CELEBRATION' && <GoalCelebration />}</AnimatePresence>
                <AnimatePresence>{currentState === 'GAME_OVER' && <Victory />}</AnimatePresence>
            </div>
        )
    }
    return null
}

export function Score() {
    const mode = gameService.game?.mode as Soccer
    const timeLeft = useObservable(mode.ui.timeLeft)
    const scoreRed = useObservable(mode.ui.scoreRed.pipe(distinctUntilChanged()))
    const scoreBlue = useObservable(mode.ui.scoreBlue.pipe(distinctUntilChanged()))
    const date = dayjs.duration((timeLeft || 0) * 1000)
    return (<>
        <div className="absolute left-0 z-20 flex h-12 bg-white shadow top-4">
            <div className="flex items-center justify-center w-16 h-12 font-semibold text-white bg-red-700">
                {scoreRed}
            </div>
            <div className="flex items-center justify-center w-20 h-12 font-semibold text-white bg-gray-800">
                { date.format('mm:ss') }
            </div>
            <div className="flex items-center justify-center w-16 h-12 font-semibold text-white bg-blue-500">
                {scoreBlue}
            </div>
        </div>
    </>
    )
}

export function KickOff() {
    const timer = useTimer({ autoStart: true, expiryTimestamp: dayjs().add(3, 'seconds').toDate() })
    return (
        <motion.h2 key={timer.seconds} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="absolute top-0 bottom-0 left-0 right-0 z-20 block mx-auto my-auto text-6xl font-black text-white h-1/2 w-min text-border">
            {timer.seconds}
        </motion.h2>
    )
}

export function GoalCelebration() {
    return (
        <motion.h2 key={ 1 } initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="absolute top-0 bottom-0 left-0 right-0 z-20 block mx-auto my-auto text-4xl font-black text-white h-1/2 w-min whitespace-nowrap text-border">
            GOAL !
        </motion.h2>
    )
}

export function Victory() {
    const mode = gameService.game?.mode as Soccer
    const scoreRed = useObservable(mode.ui.scoreRed.pipe(distinctUntilChanged()))
    const scoreBlue = useObservable(mode.ui.scoreBlue.pipe(distinctUntilChanged()))
    return (
        <motion.h2 key={ 1 } initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="absolute top-0 bottom-0 left-0 right-0 z-20 block mx-auto my-auto text-4xl font-black text-white h-1/2 w-min whitespace-nowrap text-border">
            { +(scoreRed || 0) > +(scoreBlue || 0) ? 'RED TEAM WINS' : 'BLUE TEAM WINS'}
        </motion.h2>
    )
}
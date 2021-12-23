import dayjs from "dayjs"
import { useTimer } from "react-timer-hook"

export default function KickOff() {
    const timer = useTimer({ autoStart: true, expiryTimestamp: dayjs().add(3, 'seconds').toDate() })
    return (
        <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center mx-auto my-auto">
            <h1 className="text-6xl font-bold text-white drop-shadow filter">{ timer.seconds }</h1>
        </div>
    )
}
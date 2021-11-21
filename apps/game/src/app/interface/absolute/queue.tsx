import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useSelector } from 'react-redux';
import { GiSoccerBall } from 'react-icons/gi';
import { useStopwatch } from 'react-timer-hook';
import { useEffect } from 'react';

dayjs.extend(duration)

function Queue() {
    const state = useSelector((state: any) => state.queue.queueState)
    const stopwatch = useStopwatch({ autoStart: true })
    // useEffect(() => {
        // TODO: on state change, 
        // if it's null reset stopwatch, 
        // else if stopwatch is not started, start it
    // })
    if(state) return (
        <div className='absolute top-0 left-0 right-0 flex flex-col items-center justify-center h-20 mx-auto text-white'>
            <span className='text-2xl font-extrabold leading-none text-center text-border'>
                <GiSoccerBall className="absolute left-0 right-0 mx-auto text-white text-border -top-8 filter drop-shadow rotate opacity-20" size={ 120 }/>
                <span className="relative">IN QUEUE</span>
                { ' ' }
                <span className="relative w-32 text-lg font-semibold leading-none text-border-sm">
                { stopwatch.minutes} : { String(stopwatch.seconds).padStart(2, '00') }
                </span>
            </span>
            
            <span className="relative text-xs font-medium uppercase text-border-sm">
            { state.inQueue } player{ state.inQueue > 1 && 's'} in queue
            </span>
        </div>
    )
    else return null
}

export default Queue
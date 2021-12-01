import { FaVolleyballBall } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';
import { TiCancel } from 'react-icons/ti';
import { GiStaticGuard } from 'react-icons/gi';
import { RiSettings3Fill } from 'react-icons/ri';
import { BsConeStriped, BsFillBookmarkCheckFill, BsBookmark } from 'react-icons/bs'
import { BiWorld } from 'react-icons/bi';
import socketService from '../../services/socket.service';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { IQueueState } from '@winter-sports/game-lib';
import { motion } from 'framer-motion';

function TitleScreen() {
    const queueState: IQueueState = useSelector((state: any) => state.queue.queueState)
    const socket = useSelector((state: any) => state.socket)
    const [gameModes, setGameModes] = useState([4])
    const toggle = (gameMode: number) => {
        if (queueState) socketService.leaveQueue()
        if (gameModes.includes(gameMode)) setGameModes(gameModes.filter(v => v !== gameMode))
        else setGameModes([...gameModes, gameMode])
    }
    return (
        <motion.div initial={{ opacity: 0, scale: 0.5}} animate={{ opacity: 1, scale: 1}} exit={{ opacity: 0, scale: 0.5 }}
        className="absolute text-white top-24">
            <div className="ml-24">
                <h2 className="text-xl italic font-medium leading-none filter drop-shadow">JABU JABU</h2>
                <h1 className="relative text-6xl font-extrabold">
                    <FaVolleyballBall className='absolute top-0 bottom-0 my-auto -left-8 opacity-30 rotate' size={128} />
                    <span className="relative filter drop-shadow-lg">SPORTS TOUR</span>
                </h1>
            </div>
            <div className="flex flex-col items-start mt-16 space-y-2">
                {!socket.error && !socket.online && <div className="px-5 py-2 ml-24 font-medium text-white bg-blue-500 shadow bg-opacity-30 backdrop-filter backdrop-blur">
                    <BiLoaderAlt className='inline mr-4 rotate' />
                    Connecting...
                </div>}
                {socket.error && <div className="px-5 py-2 ml-24 font-medium text-white bg-red-500 shadow bg-opacity-40 backdrop-filter backdrop-blur">
                    Could not connect to the web socket server.<br />
                    <span className="text-sm font-light">Server might be offline, try again later</span>
                    <button className="h-10 px-5 ml-24 font-normal text-white rounded filter drop-shadow-lg hover:bg-gray-700 active:bg-gray-900"
                        onClick={() => { const url = prompt('Custom web socket URL'); if (url) socketService.connectTo(url); }}>
                        Custom WEBSOCKET
                    </button>
                </div>}
                <div
                    className="flex items-center py-0 ml-24 space-x-2">
                    <GameMode players={queueState?.inQueue1v1} background="bg-white"
                        active={gameModes.includes(2)} action={() => toggle(2)}>
                        1<span className="mx-1 text-sm">vs</span>1
                    </GameMode>
                    <GameMode players={queueState?.inQueue2v2} background="bg-white"
                        active={gameModes.includes(4)} action={() => toggle(4)}>
                        2<span className="mx-1 text-sm">vs</span>2
                    </GameMode>
                    <GameMode players={queueState?.inQueue3v3} background="bg-white"
                        active={gameModes.includes(6)} action={() => toggle(6)}>
                        3<span className="mx-1 text-sm">vs</span>3
                    </GameMode>
                    {queueState && <TiCancel className="text-4xl text-white cursor-pointer" onClick={() => socketService.leaveQueue()} />}
                </div>
                <Button action={() => socketService.queue(gameModes)}>
                    {!queueState ?
                        <FaVolleyballBall className='inline mr-4' />
                        : <BiLoaderAlt className='inline mr-4 rotate' />}
                    Quick Play
                </Button>
                <Button action={() => socketService.practice()}>
                    <BsConeStriped className='inline mr-4' />
                    Practice
                </Button>
                <Button>
                    <GiStaticGuard className='inline mr-4' />
                    Customize
                </Button>
                <Button>
                    <RiSettings3Fill className='inline mr-4' />
                    Settings
                </Button>
            </div>
        </motion.div>
    )
}

function Button({ name, action, active, children }: any) {
    return (
        <button onClick={action}
            data-active={active}
            className="px-5 ml-24 text-2xl font-normal text-white rounded h-14 filter drop-shadow-lg hover:bg-white active:bg-white hover:text-black">
            {children}
        </button>
    )
}

function GameMode({ name, action, active, children, players, background }: any) {
    return (
        <button onClick={action}
            data-active={active}
            className={`w-48 transition-all text-3xl opacity-50 bg-opacity-50 border-2 border-white text-black border-opacity-50 rounded h-20 backdrop-filter backdrop-blur hover:bg-opacity-75 ${background}`}>
            {active ? <BsFillBookmarkCheckFill className="absolute left-0 text-4xl text-green-500 -top-2" /> :
                <BsBookmark className="absolute left-0 text-4xl text-white -top-1" />}
            {children}
            {players !== undefined &&
                <span className='absolute left-0 right-0 my-auto text-xs text-black opacity-50 bottom-2'>{players} in queue</span>
            }
        </button>
    )
}



export default TitleScreen
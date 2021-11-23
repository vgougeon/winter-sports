import { FaVolleyballBall } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';
import { GiStaticGuard } from 'react-icons/gi';
import { RiSettings3Fill } from 'react-icons/ri';
import { BsConeStriped } from 'react-icons/bs'
import socketService from '../../services/socket.service';
import { useSelector } from 'react-redux';

function TitleScreen() {
    const queueState = useSelector((state: any) => state.queue.queueState)
    const socket = useSelector((state: any) => state.socket)
    return (
        <div className="absolute text-white top-24">
            <div className="ml-24">
            <h2 className="text-xl italic font-medium leading-none filter drop-shadow">JABU JABU</h2>
            <h1 className="relative text-6xl font-extrabold">
                <FaVolleyballBall className='absolute top-0 bottom-0 my-auto -left-8 opacity-30 rotate' size={ 128 }/>
                <span className="relative filter drop-shadow-lg">SPORTS TOUR</span>
            </h1>
            </div>
            <div className="flex flex-col items-start mt-16 space-y-2">
            { !socket.error && !socket.online && <div className="px-5 py-2 ml-24 font-medium text-white bg-blue-500 shadow bg-opacity-30 backdrop-filter backdrop-blur">
                <BiLoaderAlt className='inline mr-4 rotate' />
                Connecting...
            </div> }
            { socket.error && <div className="px-5 py-2 ml-24 font-medium text-white bg-red-500 shadow bg-opacity-40 backdrop-filter backdrop-blur">
                Could not connect to the web socket server.<br />
                <span className="text-sm font-light">Server might be offline, try again later</span>
                <button className="h-10 px-5 ml-24 font-normal text-white rounded filter drop-shadow-lg hover:bg-gray-700 active:bg-gray-900"
                onClick={() => { const url = prompt('Custom web socket URL'); if(url) socketService.connectTo(url) }}>
                    Custom WEBSOCKET
                </button>
            </div> }
            <Button action={ () => socketService.queue() }>
                { !queueState ? 
                <FaVolleyballBall className='inline mr-4' /> 
                : <BiLoaderAlt className='inline mr-4 rotate' /> }
                Quick Play
            </Button>
            <Button action={() => socketService.practice() }>
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
        </div>
    )
}

function Button({name, action, active, children }: any) {
    return (
        <button onClick={ action }
        className="px-5 ml-24 text-2xl font-normal text-white rounded h-14 filter drop-shadow-lg hover:bg-gray-700 active:bg-gray-900">
            { children }
        </button>
    )
}


export default TitleScreen
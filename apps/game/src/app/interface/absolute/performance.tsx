import { useSelector } from 'react-redux';
import { BsBarChartFill } from 'react-icons/bs'
import { HiServer } from 'react-icons/hi'
import { Md60FpsSelect } from 'react-icons/md'

function Performance() {
    const state = useSelector((state: any) => state.socket)
    if (state) return (
        <div className='absolute top-0 right-0 flex items-center justify-center px-2 py-1 space-x-2 bg-black bg-opacity-50 rounded-bl-md'>

            <div className={`flex items-center space-x-2 
            ${state.ping < 80 ? 'text-green-400' : state.ping < 120 ? 'text-yellow-400' : 'text-red-500'}`}>
                <BsBarChartFill size={14} />
                <span className="text-xs">{state.ping !== null ? state.ping : '/'} ms</span>
            </div>
            <div className={`flex items-center space-x-2 
            ${state.averageDelta < 20 ? 'text-green-400' : state.ping < 25 ? 'text-yellow-400' : 'text-red-500'}`}>
                <HiServer size={14} />
                <span className="text-xs">{state.averageDelta !== 0 ? state.averageDelta : '/'}</span>
            </div>
            <div className={`flex items-center space-x-2 
            ${state.fps > 50 ? 'text-gray-200' : state.ping > 25 ? 'text-yellow-400' : 'text-red-500'}`}>
                <Md60FpsSelect size={14} />
                <span className="text-xs">{Math.floor(state.fps) || '/'} fps</span>
            </div>
        </div>
    )
    else return null
}

export default Performance
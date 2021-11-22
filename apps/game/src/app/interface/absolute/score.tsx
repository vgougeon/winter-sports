import { useSelector } from "react-redux"

function Score() {
    const timer = useSelector((state: any) => state.game.timer)
    const team1 = useSelector((state: any) => state.game.team1)
    const team2 = useSelector((state: any) => state.game.team2)
    
    if(timer) return (
        <div className='absolute left-0 flex items-center justify-between h-12 bg-white shadow top-4'>
            <div className="flex items-center justify-center w-20 h-full text-2xl font-extrabold text-white bg-blue-500">
                { team1 }
            </div>
            <div className="flex items-center justify-center w-32 h-full text-xl text-black">
                { timer }
            </div>
            <div className="flex items-center justify-center w-20 h-full text-2xl font-extrabold text-white bg-red-500">
                { team2 }
            </div>
        </div>
    )
    else return null;
}

export default Score
import { io, Socket } from "socket.io-client";
import { Game as GameInstance } from '@winter-sports/game-lib'
import { Game } from '../game/game';
import { resetSocket, setError, setFPS, setOnline } from "../store/socketSlice";
import store from "../store/store";
import { BehaviorSubject} from 'rxjs'

export class GameService {
    socket: Socket | null = null;
    game: GameInstance | null = null;
    localGame: Game | null = null;
    fpsLoopId?: NodeJS.Timeout

    deltaTime: number[] = []
    url = process.env.NX_WEBSOCKET_URL || 'NO_URL';

    error = new BehaviorSubject<string>('')
    fps = new BehaviorSubject<number>(0)
    socketStatus = new BehaviorSubject<boolean>(false)

    async init(canvas: HTMLCanvasElement) {
        this.localGame = new Game(canvas)
        this.game = this.localGame.game
        await this.game.init()

        this.fpsLoopId = setInterval(() => this.fps.next(this.game?.engine.performanceMonitor.averageFPS || 0), 1000)
        this.socketInit()
    }

    socketInit() {
        if (!this.socket || this.socket.connected === false) {
            this.socket = io(this.url, {
                path: '/api/socket/',
                transports: ['websocket']
            });
            this.socket.on('connect_error', () => this.socketStatus.next(false))
            this.socket.on('connect', () => this.socketStatus.next(true))
        }
    }

    async connectTo(url: string) {
        this.socket?.disconnect()
        store.dispatch(resetSocket())
        this.url = url
        this.socketInit()
    }
}

export default new GameService()
import { io, Socket } from "socket.io-client";
import { Game as GameInstance } from '@winter-sports/game-lib'
import { Game } from './../game/game';
import { resetSocket, setError, setFPS, setOnline } from "../store/socketSlice";
import store from "../store/store";

export class SocketService {
    socket: Socket | null = null;
    game: GameInstance | null = null;
    localGame: Game | null = null;
    fpsLoopId?: NodeJS.Timeout

    deltaTime: number[] = [] // X last values of Delta Time
    
    url = process.env.NX_WEBSOCKET_URL || 'NO_URL';

    async init(canvas: HTMLCanvasElement) {
        this.localGame = new Game(canvas)
        this.game = this.localGame.game
        await this.game.init()

        this.fpsLoopId = setInterval(() => store.dispatch(setFPS(this.game?.engine.performanceMonitor.averageFPS)), 100);

        this.socketInit()

    }

    socketInit() {
        if (!this.socket || this.socket.connected === false) {
            this.socket = io(this.url, {
                path: '/api/socket/',
                transports: ['websocket']
            });
            this.socket.on('connect_error', () => {
                store.dispatch(setError())
            })
            this.socket.on('connect', () => store.dispatch(setOnline()))
        }
    }

    async connectTo(url: string) {
        this.socket?.disconnect()
        store.dispatch(resetSocket())
        this.url = url
        this.socketInit()
    }
}

export default new SocketService()
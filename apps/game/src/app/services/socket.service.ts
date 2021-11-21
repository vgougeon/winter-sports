import { IGameMode, IGameState, IGInfo, IInputMap } from "@winter-sports/game-lib";
import { io, Socket } from "socket.io-client";
import { Game as GameInstance } from '@winter-sports/game-lib'
import { Game } from './../game/game';
import { setFPS, setOnline, setPing } from "../store/socketSlice";
import store from "../store/store";
import { setQueue } from "../store/queueSlice";
export class SocketService {
    socket: Socket | null = null;
    game: GameInstance | null = null;
    localGame: Game | null = null;
    fpsLoopId?: NodeJS.Timeout

    constructor() {

    }

    async init(canvas: HTMLCanvasElement) {
        this.localGame = new Game(canvas)
        this.game = this.localGame.game
        await this.game.init()

        this.fpsLoopId = setInterval(() => store.dispatch(setFPS(this.game?.engine.performanceMonitor.averageFPS)), 100);

        if (!this.socket) {
            this.socket = io("http://localhost:3333", {
                path: '/api/socket/',
                transports: ['websocket']
            });
            this.socket.on('connect', () => store.dispatch(setOnline()))

            this.socket.on('queueState', (data) => store.dispatch(setQueue(data)))

            this.socket.on('ping', (code) => this.socket?.emit('ping', code))

            this.socket.on('g', this.state.bind(this))
            this.socket.on('gInfo', this.gInfo.bind(this))
            this.queue()
        }
    }

    gInfo(gInfo: IGInfo) {
        store.dispatch(setQueue(null))
        if (this.game) this.game.startGameMode(gInfo.gameMode)
        if (this.game) this.game.playerId = gInfo.playerId
    }

    queue() {
        this.socket!.emit('queue')
    }

    state(state: IGameState) {

        this.game?.updateGame(state)
        const self = this.game?.players.find(p => p.state.id === this.game?.playerId)
        const selfNew = state.players.find(p => p.id === this.game?.playerId)
        if(self && self.state.ping !== selfNew?.ping) {
            store.dispatch(setPing(selfNew?.ping))
        }
    }

    input(inputs: IInputMap) {
        this.socket?.emit('i', inputs)
    }
}

export default new SocketService()
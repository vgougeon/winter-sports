import { IGameState, IGInfo, IInputMap, IQueueState } from "@winter-sports/game-lib";
import { io, Socket } from "socket.io-client";
import { Game as GameInstance } from '@winter-sports/game-lib'
import { Game } from './../game/game';
import { resetSocket, setAverageDelta, setError, setFPS, setOnline, setPing, setPseudo } from "../store/socketSlice";
import store from "../store/store";
import { setQueue } from "../store/queueSlice";
import { setMode, setTeam1, setTeam2, setTimer } from "../store/gameSlice";

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
            this.socket.on('pseudoSet', (pseudo: string) => store.dispatch(setPseudo(pseudo)))

            this.socket.on('queueState', (data: IQueueState) => store.dispatch(setQueue(data)))
            this.socket.on('queueLeft', () => store.dispatch(setQueue(null)))

            this.socket.on('ping', (code: number) => this.socket?.emit('ping', code))

            this.socket.on('g', this.state.bind(this))
            this.socket.on('gInfo', this.gInfo.bind(this))
        }
    }

    async connectTo(url: string) {
        this.socket?.disconnect()
        store.dispatch(resetSocket())
        this.url = url
        this.socketInit()
    }

    gInfo(gInfo: IGInfo) {
        store.dispatch(setQueue(null))
        store.dispatch(setMode(gInfo.gameMode.name))
        if (this.game) this.game.startGameMode(gInfo.gameMode)
        if (this.game) this.game.playerId = gInfo.playerId
    }

    queue(gameModes: number[]) {
        const queue = store.getState().queue.queueState
        if (!queue) this.socket!.emit('queue', gameModes)
    }

    leaveQueue() {
        const queue = store.getState().queue.queueState
        if (queue) this.socket!.emit('leaveQueue')
    }

    state(state: IGameState) {
        const uiState = store.getState()
        this.deltaTime.push(state.delta)

        const self = this.game?.players.find(p => p.state.id === this.game?.playerId)
        const selfNew = state.players.find(p => p.id === this.game?.playerId)
        if (self && self.state.ping !== selfNew?.ping) {
            store.dispatch(setAverageDelta(Math.round(this.deltaTime.reduce((t, n) => t + n, 0) / this.deltaTime.length)))
            store.dispatch(setPing(selfNew?.ping))
            this.deltaTime = []
        }

        this.game?.updateGame(state)
        
        if (uiState.game.timer !== state.timer) store.dispatch(setTimer(state.timer))
        if (uiState.game.team1 !== state.teams[0].score) store.dispatch(setTeam1(state.teams[0].score))
        if (uiState.game.team2 !== state.teams[1].score) store.dispatch(setTeam2(state.teams[1].score))
        
    }

    input(inputs: IInputMap) {
        this.socket?.emit('i', inputs)
    }

    setPseudo(pseudo: string) {
        this.socket?.emit('pseudo', pseudo)
    }

    practice() {
        store.dispatch(setMode('Practice'))
        this.game?.startGameMode({
            name: 'Practice'
        })
    }
}

export default new SocketService()
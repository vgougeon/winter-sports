import { IGameMode, IGameState } from "@winter-sports/game-lib";
import { io, Socket } from "socket.io-client";
import { Game as GameInstance } from '@winter-sports/game-lib'
import { Game } from './../game/game';
export class SocketService {
    socket: Socket | null = null;
    game: GameInstance | null = null;
    localGame: Game | null = null;
    constructor() {
        
    }

    async init(canvas: HTMLCanvasElement) {
        this.localGame = new Game(canvas)
        this.game = this.localGame.game
        await this.game.init()

        this.socket = io("http://localhost:3333", { 
            path: '/api/socket/',
            transports: ['websocket']
        });
        this.socket.on('g', this.state.bind(this))
        this.socket.on('gInfo', this.gameMode.bind(this))
        this.queue()
    }

    gameMode(gameMode: IGameMode) {
        debugger
        if(this.game) this.game.startGameMode(gameMode)
    }

    queue() {
        this.socket!.emit('queue')
    }

    state(state: IGameState) {
        if(this.game && this.game.sport) {
            this.game.sport.ball.position.x = state.ball.position.x
            this.game.sport.ball.position.y = state.ball.position.y
            this.game.sport.ball.position.z = state.ball.position.z
        }
    }
}

export default new SocketService()
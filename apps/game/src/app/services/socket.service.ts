import { IGameState } from "@winter-sports/game-lib";
import { io, Socket } from "socket.io-client";
import { Game as GameInstance } from '@winter-sports/game-lib'
export class SocketService {
    socket: Socket;
    game: GameInstance | null = null;
    constructor() {
        this.socket = io("", { 
            path: '/api/socket/'
        });
        this.socket.on('g', this.state.bind(this))
        this.queue()
    }

    queue() {
        this.socket.emit('queue')
    }

    state(state: IGameState) {
        if(this.game && this.game.sport) {
            this.game.sport.ball.position.x = state.ball.position._x
            this.game.sport.ball.position.y = state.ball.position._y
            this.game.sport.ball.position.z = state.ball.position._z
        }
    }
}

export default new SocketService()
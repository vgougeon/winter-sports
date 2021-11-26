import gamesManager from '../gamesManager/gamesManager';
import { PlayerSocket } from './../../types/player-socket.interface';

class Queue {
    players: PlayerSocket[] = []
    loopIntervalId: NodeJS.Timeout
    playersPerGame = 4

    constructor() {
        this.loopIntervalId = setInterval(() => {
            this.checkQueue()
            this.queueState()
        }, 2000)
    }

    checkQueue() {
        for(let i = 0; i < Math.floor(this.players.length / this.playersPerGame); i++) {
            this.createGame(this.players.splice(0, this.playersPerGame))
        }
    }

    createGame(players: PlayerSocket[]) {
        console.log("CREATING GAME...")
        gamesManager.createGame(players)
        console.log(`${gamesManager.games.length} total games`)
    }

    addPlayer(socket: PlayerSocket) {
        if(this.players.find(player => player === socket)) return
        this.players.push(socket)
        console.log(`${this.players.length} in queue`)
        this.sendQueueStateToPlayer(socket)
    }

    removePlayer(socket: PlayerSocket) {
        this.players = this.players.filter(player => player !== socket)
        socket.emit('queueLeft')
    }

    queueState() {
        for(let player of this.players) {
            this.sendQueueStateToPlayer(player)
        }
    }

    sendQueueStateToPlayer(socket: PlayerSocket) {
        socket.emit('queueState', { 
            inQueue: this.players.length, 
            position: this.players.findIndex(player => player === socket) + 1
        })
    }
}

export default new Queue()
import gamesManager from '../gamesManager/gamesManager';
import { PlayerSocket } from './../../types/player-socket.interface';

class Queue {
    players: PlayerSocket[] = []
    loopIntervalId: NodeJS.Timeout
    gameModes = [2, 4, 6]

    constructor() {
        this.loopIntervalId = setInterval(() => {
            this.checkQueue()
            this.queueState()
        }, 2000)
    }

    checkQueue() {
        for (let gameMode of this.gameModes.reverse()) {
            const queue = this.players.filter(p => p.gamesModes.includes(gameMode))
            for (let i = 0; i < Math.floor(queue.length / gameMode); i++) {
                console.log("CREATING A GAME mode :", gameMode)
                const game = this.createGame(queue.splice(0, gameMode))
                for(let p of game.players) {
                    this.removePlayer(p)
                }
            }
        }
    }

    createGame(players: PlayerSocket[]) {
        console.log("CREATING GAME...")
        const game = gamesManager.createGame(players)
        console.log(`${gamesManager.games.length} total games`)
        return game
    }

    addPlayer(socket: PlayerSocket, gameModes: number[]) {
        if (this.players.find(player => player === socket)) return
        socket.gamesModes = gameModes
        this.players.push(socket)
        console.log(`${this.players.length} in queue for ${socket.gamesModes.map(g => `${g / 2}v${g / 2}`).join(' & ')}`)
        this.sendQueueStateToPlayer(socket)
    }

    removePlayer(socket: PlayerSocket) {
        this.players = this.players.filter(player => player !== socket)
        socket.emit('queueLeft')
    }

    queueState() {
        for (let player of this.players) {
            this.sendQueueStateToPlayer(player)
        }
    }

    sendQueueStateToPlayer(socket: PlayerSocket) {
        socket.volatile.emit('queueState', {
            inQueue: this.players.length,
            position: this.players.findIndex(player => player === socket) + 1,
            gameModes: socket.gamesModes || [],
            inQueue1v1: this.players.filter(p => p.gamesModes.includes(2)).length,
            inQueue2v2: this.players.filter(p => p.gamesModes.includes(4)).length,
            inQueue3v3: this.players.filter(p => p.gamesModes.includes(6)).length
        })
    }
}

export default new Queue()
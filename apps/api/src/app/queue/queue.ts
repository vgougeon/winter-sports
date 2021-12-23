import gamesManager from '../gamesManager/gamesManager';
import { PlayerSocket } from './../../types/player-socket.interface';

class Queue {
    players: PlayerSocket[] = []
    loopIntervalId: NodeJS.Timeout
    gameModes = ['Soccer']
    minPlayers = 1
    constructor() {
        this.loopIntervalId = setInterval(() => {
            this.checkQueue()
            this.queueState()
        }, 2000)
    }

    checkQueue() {
        for (let gameMode of this.gameModes.reverse()) {
            const queue = this.players.filter(p => p.gamesModes.includes(gameMode))
            for (let i = 0; i < Math.floor(queue.length / this.minPlayers); i++) {
                console.log("CREATING A GAME mode :", gameMode)
                const players = queue.splice(0, this.minPlayers)
                this.createGame(players, gameMode)
                this.players = this.players.filter(p => !players.includes(p))
            }
        }
        
    }

    createGame(players: PlayerSocket[], gameMode: string) {
        console.log("CREATING GAME...")
        const game = gamesManager.createGame(players, gameMode)
        console.log(`${gamesManager.games.length} total games`)
        return game
    }

    addPlayer(socket: PlayerSocket, gameModes: string[]) {
        if (this.players.find(player => player === socket)) return
        socket.gamesModes = gameModes
        this.players.push(socket)
        console.log(`${this.players.length} in queue for ${socket.gamesModes.join(' & ')}`)
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
            inQueueSoccer: this.players.filter(p => p.gamesModes.includes('Soccer')).length,
        })
    }
}

export default new Queue()
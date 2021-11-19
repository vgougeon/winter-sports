import { PlayerSocket } from '../../types/player-socket.interface';
import * as BABYLON from 'babylonjs';
import { Game as GameInstance } from '@winter-sports/game-lib';

export class Game {
    engine: BABYLON.Engine
    game: GameInstance
    loopIntervalId: NodeJS.Timeout
    tickRate = 60
    players: PlayerSocket[]

    constructor(players?: PlayerSocket[]) {
        this.players = players
        this.engine = new BABYLON.NullEngine()
        this.game = new GameInstance(this.engine)

        this.loopIntervalId = setInterval(this.loop.bind(this), 1000/ this.tickRate)
    }

    loop() {
        for(let player of this.players) {
            player.emit('g', { tick : "tick"})
        }
    }
    
}
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
        this.bindPlayer(this.players[0])
        this.engine = new BABYLON.NullEngine()
        this.game = new GameInstance(this.engine)

        this.loopIntervalId = setInterval(this.loop.bind(this), 1000/ this.tickRate)

        setTimeout(() => {
            this.game.sport.ball.applyImpulse(
                new BABYLON.Vector3(10, 0, 0), 
                new BABYLON.Vector3(0, 0, 0)
            )
        }, 3000)
    }

    bindPlayer(player: PlayerSocket) {
        player.on('disconnect', () => {
            this.game.scene.dispose()
            clearInterval(this.loopIntervalId)
        })
    }

    loop() {
        if(this.game.sport) {
            for(let player of this.players) {
                player.emit('g', { 
                    ball: { 
                        position: this.game.sport.ball.position,
                        rotation: this.game.sport.ball.rotation
                    }
                })
            }
        }
    }
    
}
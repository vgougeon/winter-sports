import { PlayerSocket } from '../../types/player-socket.interface';
import * as BABYLON from 'babylonjs';
import { Game as GameInstance } from '@winter-sports/game-lib';
import { Player } from '@winter-sports/game-lib';
import { IGameMode } from './../../../../../libs/game-lib/src/lib/interfaces';

export class Game {
    engine: BABYLON.Engine
    game: GameInstance
    loopIntervalId: NodeJS.Timeout
    tickRate = 60
    players: PlayerSocket[]
    playerMap: Player[] = []

    gameMode: IGameMode = {
        name: 'Soccer',
        fieldWidth: 200,
        fieldHeight: 120
    }

    gameState: any = {}

    constructor(players?: PlayerSocket[]) {
        this.players = players
        this.engine = new BABYLON.NullEngine()
        this.game = new GameInstance(this.engine, { isServer: true })

        this.init()
    }

    async init() {
        await this.game.init()
        await this.game.startGameMode(this.gameMode)

        this.initPlayer(this.players[0])
        this.initialGameState()

        this.loopIntervalId = setInterval(this.loop.bind(this), 1000 / this.tickRate)

        setTimeout(() => {
            this.game.sport.ball.applyImpulse(
                new BABYLON.Vector3(10, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            )
        }, 3000)
    }

    initialGameState() {
        this.gameState = {
            teams: [
                { id: 0, score: 0 },
                { id: 1, score: 0 }
            ]
        }
        this.updateGameState()
    }

    updateGameState() {
        this.gameState.ball = {
            position:  { 
                x: this.game.sport.ball.position.x,
                y: this.game.sport.ball.position.y,
                z: this.game.sport.ball.position.z
            },
            rotation:  { 
                x: this.game.sport.ball.rotation.x,
                y: this.game.sport.ball.rotation.y,
                z: this.game.sport.ball.rotation.z
            }
        }
        this.gameState.players = this.playerMap.map(player => ({
            ...player.state,
            position: {
                x: player.collider.position.x,
                y: player.collider.position.y,
                z: player.collider.position.z
            },
            velocity: {
                x: player.velocity.x,
                y: player.velocity.y,
                z: player.velocity.z
            }
        }))
    }

    initPlayer(player: PlayerSocket) {
        const createPlayer = new Player(this.game, { 
            id: player.id, 
            teamId: 0,
            name: player.pseudo || 'NO_NAME'
        })
        this.playerMap.push(createPlayer)

        player.on('i', this.input.bind(this))
        player.on('disconnect', () => {
            this.game.scene.dispose()
            clearInterval(this.loopIntervalId)
            //TODO: This logic will shutdown server if a player leave, to be modified
        })

        player.emit('gInfo', this.gameMode)
    }

    input(player: PlayerSocket) {

    }

    loop() {
        this.updateGameState()
        if (this.game.sport) {
            for (let player of this.players) {
                player.emit('g', this.gameState)
            }
        }
    }

}
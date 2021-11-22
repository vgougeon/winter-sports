import { PlayerSocket } from '../../types/player-socket.interface';
import * as BABYLON from 'babylonjs';
import { Game as GameInstance, TICK_RATE, Player, IGameMode, IGInfo, IInputMap } from '@winter-sports/game-lib';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
export class Game {
    engine: BABYLON.Engine
    game: GameInstance
    loopIntervalId: NodeJS.Timeout
    pingIntervalId: NodeJS.Timeout
    tickRate = TICK_RATE
    players: PlayerSocket[]

    gameMode: IGameMode = {
        name: 'Soccer',
        fieldWidth: 200,
        fieldHeight: 120,
        time: 60 * 5
    }

    gameStartAt?: Dayjs;

    lastPing = { time: dayjs(), code: Math.random()}

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

        this.game.sport.subscriptions.blueGoal = () => {
            this.gameState.teams[0].score += 1
        }

        this.game.sport.subscriptions.redGoal = () => {
            this.gameState.teams[1].score += 1
        }

        this.gameStartAt = dayjs()

        for(let player of this.players) this.initPlayer(player)
        this.initialGameState()

        this.loopIntervalId = setInterval(this.loop.bind(this), 1000 / this.tickRate)
        this.pingIntervalId = setInterval(this.ping.bind(this), 2000)

        setTimeout(() => {
            this.game.sport.ball.applyImpulse(
                new BABYLON.Vector3(10, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            )
        }, 3000)
    }

    ping() {
        this.lastPing = { time: dayjs(), code: Math.random() }
        for(let player of this.players) player.emit('ping', this.lastPing.code)
    }

    pong(socket: PlayerSocket, code: number) {
        if(code === this.lastPing.code) {
            socket.ping = dayjs().diff(this.lastPing.time)
            const player = this.game.players.find(p => p.state.id === socket.id)
            player.state.ping = socket.ping
        }
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
        const ball = this.game.sport.ball
        const ballAngularVelocity = ball.physicsImpostor.getAngularVelocity()
        const ballLinearVelocity = ball.physicsImpostor.getLinearVelocity()

        this.gameState.timer = dayjs.duration(this.gameStartAt.add(5, 'minutes').diff(dayjs())).format('m:ss')
        this.gameState.ball = {
            position:  { 
                x: ball.position.x,
                y: ball.position.y,
                z: ball.position.z
            },
            rotation:  { 
                x: ball.rotation.x,
                y: ball.rotation.y,
                z: ball.rotation.z
            },
            angularVelocity: {
                x: ballAngularVelocity.x,
                y: ballAngularVelocity.y,
                z: ballAngularVelocity.z
            },
            linearVelocity: {
                x: ballLinearVelocity.x,
                y: ballLinearVelocity.y,
                z: ballLinearVelocity.z
            },
        }
        this.gameState.players = this.game.players.map(player => ({
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
            teamId: this.game.players.length % 2,
            name: player.pseudo || 'NO_NAME'
        })
        this.game.players.push(createPlayer)

        player.on('i', this.input.bind(this, player))
        player.on('ping', this.pong.bind(this, player))
        player.on('disconnect', () => {
            this.game.scene.dispose()
            clearInterval(this.loopIntervalId)
            //TODO: This logic will shutdown server if a player leave, to be modified
        })

        player.emit('gInfo', {
            gameMode: this.gameMode,
            playerId: player.id
        } as IGInfo)
    }

    input(player: PlayerSocket, inputs: IInputMap) {
        const playerInstance = this.game.players.find(p => p.state.id === player.id)
        if(playerInstance) {
            playerInstance.currentInputs = inputs
        }
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
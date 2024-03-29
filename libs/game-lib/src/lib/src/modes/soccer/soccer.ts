import { Game } from '../../../game-lib';
import { BasePlayer } from '../../player/player';
import { SoccerBall } from './ball';
import { SoccerPlayer } from './player';
import { SoccerWorld } from './world';
import * as BABYLON from 'babylonjs';
import { SoccerFSM } from './soccerFSM';
import { SoccerUI } from './soccerUI';
import { PlayerSocket } from './../../../../../../../apps/api/src/types/player-socket.interface';

export class Soccer {
    world!: SoccerWorld
    ball!: SoccerBall;
    players: SoccerPlayer[] = [];
    fsm!: SoccerFSM;
    ui!: SoccerUI;
    loopCall = this.loop.bind(this)
    serverLoop = this.server.bind(this)
    constructor(private game: Game) {}

    init() {
        this.world = new SoccerWorld(this.game, this)
        this.ball = new SoccerBall(this.game, this)
        this.players = []
        this.fsm = new SoccerFSM(this.game, this)
        this.ui = new SoccerUI(this.game, this)
        this.game.scene.registerBeforeRender(this.loopCall)
        if(!this.game.canvas) {
            this.game.scene.registerBeforeRender(this.serverLoop)
            this.game.emitter.next({ event: 'gInfo', args: this.gInfo() })
            //TODO: Think about a way to send gInfo to newcomers
        }
        this.game.currentState.next('Soccer')
    }

    server() {
        this.game.emitter.next({ event: 'g', args: this.getState()})
    }

    gInfo() {
        return {
            gameMode: "Soccer",
        }
    }
    
    getState() {
        return {
            ball: this.ball.getState(),
            players: this.players.map(p => p.getState()),
            ...this.fsm.getState()
        }
    }

    setState(state: any) {
        this.ball.setState(state.ball);
        this.setPlayerState(state.players)
        this.fsm.setState(state);
    }

    setPlayerState(players: any[]) {
        for(let player of players) {
            let currentPlayer = this.players.find(p => p.id === player.id)
            if(!currentPlayer) {
                console.debug()
                currentPlayer = new SoccerPlayer(this.game, this, 0)
                currentPlayer.setId(player.id)
                currentPlayer.setPseudo(player.pseudo)
                this.players.push(currentPlayer)
            }
            currentPlayer.setState(player)
        }
    }

    kickOffPosition() {
        const place = (team: number, index: number) => {
            return new BABYLON.Vector3(
                ((team ? -1 : 1) * this.world.settings.width / 3) * ((index === 0) ? 0.5 : 1),
                3,
                (index === 0) ? 0 : (index === 1) ? this.world.settings.depth / 4 : - this.world.settings.depth / 4
            )
        }
        this.ball.mesh.position = new BABYLON.Vector3(0, 2, 0)
        this.ball.mesh.physicsImpostor?.setAngularVelocity(BABYLON.Vector3.Zero())
        this.ball.mesh.physicsImpostor?.setLinearVelocity(BABYLON.Vector3.Zero())
        this.players.filter(p => p.teamId === 0).map((p, i) => {
            p.collider.position = place(p.teamId, i)
            p.collider.lookAt(this.ball.mesh.position, Math.PI, 0, 0, BABYLON.Space.WORLD)
        })
        this.players.filter(p => p.teamId === 1).map((p, i) => {
            p.collider.position = place(p.teamId, i)
            p.collider.lookAt(this.ball.mesh.position, Math.PI, 0, 0, BABYLON.Space.WORLD)
        })
    }

    gameOver() {
        const overCamera = new BABYLON.FreeCamera('game_over_camera', new BABYLON.Vector3(0, 5, 25), this.game.scene)
        overCamera.target = BABYLON.Vector3.Zero()

        const spacing = 6;
        const winnerTeam = this.fsm.state.score[0] >= this.fsm.state.score[1] ? 0 : 1
        const winners = this.players.filter(p => p.teamId === winnerTeam)
        const losers = this.players.filter(p => p.teamId !== winnerTeam)

        losers.map((p) => p.destroy())
        const startAt = -((winners.length+1) / 2) *spacing
        winners.map((p, i) => {
            p.collider.position = new BABYLON.Vector3(startAt + (i+1) * spacing, 5, 0)
            console.log('lookAt over')
            p.collider.lookAt(overCamera.position, Math.PI, 0, 0, BABYLON.Space.WORLD)
            if(p.renderer) p.renderer.lookAt = overCamera
        })

        this.ball.mesh.position = new BABYLON.Vector3(0, 20, 8)

        this.game.scene.switchActiveCamera(overCamera)

    }

    loop() {
        this.ball.update()
        this.fsm.transition()
        this.ui.update()
    }

    destroy() {
        this.game.scene.unregisterBeforeRender(this.loopCall)
        this.world.destroy()
        this.ball.destroy()
        for(let player of this.players) player.destroy()
    }

    addPlayers(players: PlayerSocket[]) {
        for(let player of players) {
            const p = new SoccerPlayer(this.game, this, 0)
            p.id = player.id
            p.pseudo = player.pseudo || 'John'
            this.players.push(p)
        }
    }


}
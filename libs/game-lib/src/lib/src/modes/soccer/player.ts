import { Game, Soccer } from '@winter-sports/game-lib';
import { BasePlayer } from '../../player/player';
import * as BABYLON from 'babylonjs'

export class SoccerPlayer extends BasePlayer {
    constructor(private g: Game, private mode: Soccer, public teamId: number) {
        super(g)
        if (this.renderer) this.renderer!.lookAt = this.mode.ball.mesh

    }

    loop() {
        if (this.mode.fsm.state.kickoff) {
            this.g.input!.inputs = {}
        }
        super.loop()
    }

    getState() {
        return {
            id: this.id,
            pseudo: this.pseudo || 'Anon',
            position: {
                x: this.collider.position.x,
                y: this.collider.position.y,
                z: this.collider.position.z,
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y,
                z: this.velocity.z,
            },
            action: 'NONE' //TODO: Yelling, calling ...
        }
    }

    setState(playerState: any) {
        this.velocity.x = playerState.velocity.x
        this.velocity.y = playerState.velocity.y
        this.velocity.z = playerState.velocity.z
        this.collider.position.x = playerState.position.x
        this.collider.position.y = playerState.position.y
        this.collider.position.z = playerState.position.z
    }
}
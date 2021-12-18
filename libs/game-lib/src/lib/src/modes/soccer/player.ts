import { Game, Soccer } from '@winter-sports/game-lib';
import { BasePlayer } from '../../player/player';

export class SoccerPlayer extends BasePlayer {
    constructor(private g: Game, private mode: Soccer, public teamId: number) {
        super(g)
        this.renderer!.lookAt = this.mode.ball.mesh
    }

    loop() {
        if(this.mode.fsm.state.kickoff) {
            this.g.input!.inputs = {}
        }
        super.loop()
    }
}
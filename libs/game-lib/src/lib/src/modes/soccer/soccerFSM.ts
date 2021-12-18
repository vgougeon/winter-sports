import { Game, Soccer } from '@winter-sports/game-lib';
import dayjs from 'dayjs';
export class SoccerFSM {
    currentState: string = 'UNKNOWN'
    state = {
        started: false,
        celebration: false,
        kickoff: false,
        end: dayjs().add(5, 'minutes'),
        score: [0, 0]
    }

    constructor(private game: Game, private mode: Soccer) { }

    transition() {
        this.checkState('UNKNOWN', 'WAITING_FOR_PLAYERS', () => true)
        this.checkState('WAITING_FOR_PLAYERS', 'KICKOFF', this.isPlayerReady.bind(this))
        this.checkState('KICKOFF', 'GAMEPLAY', this.isKickoffDone.bind(this))
        this.checkState('GAMEPLAY', 'GOAL_CELEBRATION', this.isGoalScored.bind(this))
        this.checkState('GOAL_CELEBRATION', 'KICKOFF', this.isCelebrationOver.bind(this))
        this.checkState('GAMEPLAY', 'BALL_OUT', this.isBallOut.bind(this))
        this.checkState('BALL_OUT', 'KICKOFF', () => true)
        this.checkState('GAMEPLAY', 'GAME_OVER', this.isTimeOver.bind(this))
        this.checkState('GAME_OVER', 'GAME_DESTROY', this.isTimeOver.bind(this))
    }


    setState(to: string) {
        console.debug(`${this.currentState} >>> ${to}`)
        this.currentState = to

        switch (to) {
            case 'KICKOFF':
                console.log(this.state.score)
                this.state.kickoff = true
                setTimeout(() => this.state.kickoff = false, 3000)
                this.mode.kickOffPosition()
                break;
            case 'GOAL_CELEBRATION':
                console.log(this.state.score)
                this.state.celebration = true
                setTimeout(() => this.state.celebration = false, 3000)
                break;
            case 'GAME_OVER':
                this.state.end = dayjs().add(20, 'seconds')
                this.mode.gameOver()
                break;
            case 'GAME_DESTROY':
                this.mode.destroy()

        }
    }

    checkState(from: string, to: string, condition: Function) {
        if (from === this.currentState && condition()) this.setState(to)
    }

    isPlayerReady() {
        return true
    }

    isKickoffDone() {
        return this.state.kickoff === false
    }

    isTimeOver() {
        return this.state.end <= dayjs()
    }

    isCelebrationOver() {
        return this.state.celebration === false
    }

    isGoalScored() {
        let isScored = false
        if (this.mode.world.blueGoalZone.intersectsMesh(this.mode.ball.mesh)) {
            this.state.score[0] += 1;
            isScored = true
        }
        else if (this.mode.world.redGoalZone.intersectsMesh(this.mode.ball.mesh)) {
            this.state.score[1] += 1;
            isScored = true
        }
        return isScored
    }

    isBallOut() {
        if (Math.abs(this.mode.ball.mesh.position.z) > this.mode.world.settings.depth / 2 + 10) return true
        if (Math.abs(this.mode.ball.mesh.position.x) > this.mode.world.settings.width / 2 + 10) return true
        return false
    }
}
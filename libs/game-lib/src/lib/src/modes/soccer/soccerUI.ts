import { Game } from "@winter-sports/game-lib";
import { Soccer } from "./soccer";
import { BehaviorSubject, map } from 'rxjs';
import dayjs, { Dayjs } from "dayjs";

export class SoccerUI {
    scoreRed: BehaviorSubject<number>;
    scoreBlue: BehaviorSubject<number>;
    currentState: BehaviorSubject<string>;
    end: BehaviorSubject<Dayjs>;
    timeLeft: BehaviorSubject<number>;

    constructor(private game: Game, private mode: Soccer) {
        this.scoreRed = new BehaviorSubject<number>(mode.fsm.state.score[0])
        this.scoreBlue = new BehaviorSubject<number>(mode.fsm.state.score[1])
        this.currentState = new BehaviorSubject<string>(mode.fsm.currentState)
        this.end = new BehaviorSubject<Dayjs>(mode.fsm.state.end)
        this.timeLeft = new BehaviorSubject<number>(Math.floor(mode.fsm.state.end.diff(dayjs()) / 1000))
        console.log(this.timeLeft.value)
    }

    update() {
        this.updateItem(this.scoreRed, this.mode.fsm.state.score[0])
        this.updateItem(this.scoreBlue, this.mode.fsm.state.score[1])
        this.updateItem(this.currentState, this.mode.fsm.currentState)
        this.updateItem(this.end, this.mode.fsm.state.end)
        this.updateItem(this.timeLeft, Math.floor(this.mode.fsm.state.end.diff(dayjs()) / 1000))
    }

    updateItem(subject: BehaviorSubject<any>, value: any) {
        subject.next(value)
    }
}
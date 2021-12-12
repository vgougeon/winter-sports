import { Game, Soccer } from '@winter-sports/game-lib';
import { BasePlayer } from '../../player/player';

export class SoccerPlayer extends BasePlayer {
    constructor(g: Game, private mode: Soccer) {
        super(g)
        this.collider.position.y = 5
    }
}
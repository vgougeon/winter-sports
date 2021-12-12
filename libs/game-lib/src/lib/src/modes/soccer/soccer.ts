import { Game } from '../../../game-lib';
import { BasePlayer } from '../../player/player';
import { SoccerPlayer } from './player';
import { SoccerWorld } from './world';

export class Soccer {
    world!: SoccerWorld
    constructor(private game: Game) {}
    init() {
        this.world = new SoccerWorld(this.game, this)
        const player = new SoccerPlayer(this.game, this)
    }
}
import { Game } from '../../../game-lib';
import { Player } from '../../player/player';
import { SoccerWorld } from './world';

export class Soccer {
    world!: SoccerWorld
    constructor(private game: Game) {}
    init() {
        this.world = new SoccerWorld(this.game, this)

        // const player = new Player(this.game)
    }
}
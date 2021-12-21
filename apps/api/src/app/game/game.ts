import { PlayerSocket } from '../../types/player-socket.interface';
import * as BABYLON from 'babylonjs';
import { Game as GameInstance } from '@winter-sports/game-lib';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
export class Game {
    engine: BABYLON.Engine
    game: GameInstance
 

    constructor(public players: PlayerSocket[], private gameMode: string) {
        this.engine = new BABYLON.NullEngine()
        this.game = new GameInstance(this.engine)
        this.game.init()
        this.game.setMode(gameMode)
    }

}
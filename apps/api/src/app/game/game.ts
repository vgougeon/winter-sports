import { PlayerSocket } from '../../types/player-socket.interface';
import * as BABYLON from 'babylonjs';
import { Game as GameInstance } from '@winter-sports/game-lib';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
export class Game {
    engine: BABYLON.Engine
    game: GameInstance
 

    constructor(players?: PlayerSocket[]) {
        this.engine = new BABYLON.NullEngine()
        this.game = new GameInstance(this.engine, { isServer: true })
    }

}
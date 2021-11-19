import * as BABYLON from 'babylonjs';
import { Game as GameInstance } from '@winter-sports/game-lib'
export class Game {
    game: GameInstance
    engine: BABYLON.Engine

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas, true)
        this.game = new GameInstance(this.engine, canvas)
    }
}
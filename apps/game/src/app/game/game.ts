import * as BABYLON from 'babylonjs';
import { Game as GameInstance, TICK_RATE } from '@winter-sports/game-lib'
import socketService from '../services/sockets.service';
export class Game {
    game: GameInstance
    engine: BABYLON.Engine
    loopIntervalId: NodeJS.Timeout;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas, true)
        this.game = new GameInstance(this.engine, { canvas: canvas })
        this.loopIntervalId = setInterval(this.loop.bind(this), 1000 / TICK_RATE)
    }

    async init() {
        await this.game.init()
    }

    loop() {
        if(this.game.input) this.game.currentInputs = this.game.input.getInputs()
        // if(this.game.input && this.game.self) {
        //     socketService.input(this.game.currentInputs)
        // }
    }
}
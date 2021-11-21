import * as BABYLON from 'babylonjs';
import { Game as GameInstance, TICK_RATE } from '@winter-sports/game-lib'
import socketService from '../services/socket.service';
import { Input } from './input';
export class Game {
    game: GameInstance
    engine: BABYLON.Engine
    inputs?: Input;
    loopIntervalId: NodeJS.Timeout;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas, true)
        this.game = new GameInstance(this.engine, { canvas: canvas })
        this.loopIntervalId = setInterval(this.loop.bind(this), 1000 / TICK_RATE)

        this.init()
    }

    async init() {
        await this.game.init()
        this.inputs = new Input(this)
    }

    loop() {
        if(this.inputs && this.game.self) {
            socketService.input(this.inputs.getInputs())
        }
    }
}
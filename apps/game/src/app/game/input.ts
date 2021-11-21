import { Game } from "./game";
import * as BABYLON from 'babylonjs';
import { IInputMap } from "@winter-sports/game-lib";

export class Input {
    gameController: Game;

    gamepadManager: BABYLON.GamepadManager;
    keys: Record<string, string[]> = {
        UP: ['Z', 'z', 'STICK_UP'],
        DOWN: ['S', 's', 'STICK_DOWN'],
        RIGHT: ['D', 'd', 'STICK_RIGHT'],
        LEFT: ['Q', 'q', 'STICK_LEFT']
    }

    inputs: Record<string, number> = {}

    constructor(game: Game) {
        this.gameController = game;
        this.gameController.game.scene.actionManager = 
        new BABYLON.ActionManager(this.gameController.game.scene);

        const am = this.gameController.game.scene.actionManager;
        this.gamepadManager = new BABYLON.GamepadManager()

        am.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown" ? 1 : 0;
        }));
        am.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown" ? 1 : 0;
        }));

        this.gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
            gamepad.onleftstickchanged((values) => {
                this.inputs['STICK_UP'] = 0
                this.inputs['STICK_DOWN'] = 0
                this.inputs['STICK_RIGHT'] = 0
                this.inputs['STICK_LEFT'] = 0
                if (Math.abs(values.y) > 0.1) {
                    if (values.y < 0) this.inputs['STICK_UP'] = Math.abs(values.y)
                    else this.inputs['STICK_DOWN'] = Math.abs(values.y)
                }
                if (Math.abs(values.x) > 0.1) {
                    if (values.x < 0) this.inputs['STICK_LEFT'] = Math.abs(values.x)
                    else this.inputs['STICK_RIGHT'] = Math.abs(values.x)
                }
            })
        })
    }

    getInputs() {
        const i: IInputMap = {}
        for(let [key, value] of Object.entries(this.inputs)) {
            if(value > 0)  {
                const actionName = this.getActionName(key)
                if(actionName) i[actionName] = value
            }
        }
        return i
    }

    getActionName(key: string) {
        for(let [action, keys] of Object.entries(this.keys)) {
            if(keys.includes(key)) return action
        }
        return false
    }


}
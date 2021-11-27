import * as BABYLON from 'babylonjs';
import { IInputMap, Game } from "@winter-sports/game-lib";

export class Input {
    game: Game;

    gamepadManager: BABYLON.GamepadManager;
    keys: Record<string, string[]> = {
        UP: ['Z', 'z', 'STICK_UP'],
        DOWN: ['S', 's', 'STICK_DOWN'],
        RIGHT: ['D', 'd', 'STICK_RIGHT'],
        LEFT: ['Q', 'q', 'STICK_LEFT'],
        LEFT_TRIGGER: ['LEFT_TRIGGER'],
        RIGHT_TRIGGER: ['RIGHT_TRIGGER'],
        A: ['PAD_A'],
        B: ['PAD_B'],
        X: ['PAD_X'],
        Y: ['PAD_Y'],
        RB: ['PAD_RB'],
        LB: ['PAD_LB'],
    }

    inputs: Record<string, number> = {}

    constructor(game: Game) {
        this.game = game;
        this.game.scene.actionManager = 
        new BABYLON.ActionManager(this.game.scene);

        const am = this.game.scene.actionManager;
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
            });

            if(gamepad instanceof BABYLON.Xbox360Pad) {
                gamepad.onlefttriggerchanged((value) => {
                    if(value > 0.1) this.inputs['LEFT_TRIGGER'] = 1
                    else this.inputs['LEFT_TRIGGER'] = 0
                });
    
                gamepad.onrighttriggerchanged((value) => {
                    if(value > 0.1) this.inputs['RIGHT_TRIGGER'] = 1
                    else this.inputs['RIGHT_TRIGGER'] = 0
                })

                gamepad.onButtonDownObservable.add((button: any)=>{
                    console.log(button, BABYLON.Xbox360Button[button])
                    this.inputs[`PAD_${BABYLON.Xbox360Button[button]}`] = 1;
                });

                gamepad.onButtonUpObservable.add((button: any)=>{
                    console.log(button, BABYLON.Xbox360Button[button])
                    this.inputs[`PAD_${BABYLON.Xbox360Button[button]}`] = 0;
                });

            }
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
import * as BABYLON from 'babylonjs';
import { IInputMap, Game } from "@winter-sports/game-lib";
import { convolutionPixelShader } from 'babylonjs/Shaders/convolution.fragment';

export class Input {
    game: Game;

    gamepadManager: BABYLON.GamepadManager;
    keys: Record<string, string[]> = {
        UP: ['Z', 'STICK_UP'],
        DOWN: ['S', 'STICK_DOWN'],
        RIGHT: ['D', 'STICK_RIGHT'],
        LEFT: ['Q', 'STICK_LEFT'],
        LEFT_TRIGGER: ['LEFT_TRIGGER'],
        RIGHT_TRIGGER: ['SHIFT', 'RIGHT_TRIGGER'],
        A: ['PAD_A', 'PAD_Cross'],
        B: ['LMB', 'PAD_B', 'PAD_Circle'],
        X: ['PAD_X', 'PAD_Square'],
        Y: ['PAD_Y', 'PAD_Triangle'],
        RB: ['PAD_RB', 'PAD_L1'],
        LB: ['PAD_LB', 'PAD_R1'],
    }

    inputs: Record<string, number> = {}

    constructor(game: Game) {
        this.game = game;
        this.game.scene.actionManager = 
        new BABYLON.ActionManager(this.game.scene);

        const am = this.game.scene.actionManager;
        this.gamepadManager = new BABYLON.GamepadManager()

        am.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key.toUpperCase()] = evt.sourceEvent.type == "keydown" ? 1 : 0;
        }));
        am.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key.toUpperCase()] = evt.sourceEvent.type == "keydown" ? 1 : 0;
        }));
 
        this.game.scene.onPointerObservable.add((event) => {
            if(event.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                if(event.event.button === 0) this.inputs['LMB'] = 1
                else if(event.event.button === 2) this.inputs['RMB'] = 1
                else if(event.event.button === 1) this.inputs['MMB'] = 1
            }
            else if(event.type === BABYLON.PointerEventTypes.POINTERUP) {
                if(event.event.button === 0) this.inputs['LMB'] = 0
                else if(event.event.button === 2) this.inputs['RMB'] = 0
                else if(event.event.button === 1) this.inputs['MMB'] = 0
            }
        })


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
                    this.inputs[`PAD_${BABYLON.Xbox360Button[button]}`] = 1;
                });

                gamepad.onButtonUpObservable.add((button: any)=>{
                    this.inputs[`PAD_${BABYLON.Xbox360Button[button]}`] = 0;
                });

            }

            if (gamepad instanceof BABYLON.DualShockPad) {
                gamepad.onButtonDownObservable.add((button, state)=>{
                    console.log(button, "PS4", BABYLON.DualShockButton[button])
                    this.inputs[`PAD_${BABYLON.DualShockButton[button]}`] = 1;
                })
                gamepad.onButtonUpObservable.add((button, state)=>{
                    this.inputs[`PAD_${BABYLON.DualShockButton[button]}`] = 0;
                })

                gamepad.onlefttriggerchanged((value) => {
                    if(value > 0.1) this.inputs['LEFT_TRIGGER'] = 1
                    else this.inputs['LEFT_TRIGGER'] = 0
                });
    
                gamepad.onrighttriggerchanged((value) => {
                    if(value > 0.1) this.inputs['RIGHT_TRIGGER'] = 1
                    else this.inputs['RIGHT_TRIGGER'] = 0
                })
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
import { Game } from "../gameOld";
import * as BABYLON from 'babylonjs';

export class Input {
    game: Game;
    inputs: Record<string, number> = {}
    keys: Record<string, string[]> = {
        UP: ['Z', 'z', 'STICK_UP'],
        DOWN: ['S', 's', 'STICK_DOWN'],
        RIGHT: ['D', 'd', 'STICK_RIGHT'],
        LEFT: ['Q', 'q', 'STICK_LEFT']
    }
    constructor(game: Game) {
        this.game = game
        this.game.scene.actionManager = new BABYLON.ActionManager(this.game.scene)

        this.game.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown" ? 1 : 0;
        }));
        this.game.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown" ? 1 : 0;
        }));

        this.game.gamepad.onGamepadConnectedObservable.add((gamepad, state) => {
            (gamepad as any).onButtonDownObservable.add((button: any, type: any) => {
                if(BABYLON.Xbox360Button[button] === 'A') this.game.player!.collider!.physicsImpostor!.restitution = 2.6
                if(BABYLON.Xbox360Button[button] === 'B') this.game.player!.collider!.physicsImpostor!.restitution = 5.5
                if(BABYLON.Xbox360Button[button] === 'LB') this.game.player!.speed = 0.08
                console.log('DOWN', BABYLON.Xbox360Button[button])
            });
            (gamepad as any).onButtonUpObservable.add((button: any, type: any) => {
                if(BABYLON.Xbox360Button[button] === 'A') this.game.player!.collider!.physicsImpostor!.restitution = 1.3
                if(BABYLON.Xbox360Button[button] === 'B') this.game.player!.collider!.physicsImpostor!.restitution = 1.3
                if(BABYLON.Xbox360Button[button] === 'LB') this.game.player!.speed = 0.05
                console.log('UP', BABYLON.Xbox360Button[button])
            });
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
        });
    }

    isPressed(name: string): number {
        if (this.keys[name]) {
            for (let key of this.keys[name]) {
                if (this.inputs[key]) return this.inputs[key]
            }
        }
        return 0
    }
}
import { Game } from "../game";
import * as BABYLON from 'babylonjs';

export class Input {
    game: Game;
    inputs: Record<string, boolean> = {}
    keys: Record<string, string[]> = {
        UP: ['Z', 'z'],
        DOWN: ['S', 's'],
        RIGHT: ['D', 'd'],
        LEFT: ['Q', 'q']
    }
    constructor(game: Game) {
        this.game = game
        this.game.scene.actionManager = new BABYLON.ActionManager(this.game.scene)
        
        this.game.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        this.game.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
    }

    isPressed(name: string): boolean {
        if(this.keys[name]) {
            for(let key of this.keys[name]) {
                if(this.inputs[key]) return true
            }
        }
        return false
    }
}
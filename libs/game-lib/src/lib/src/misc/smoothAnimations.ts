import { Game } from '@winter-sports/game-lib';
import * as BABYLON from 'babylonjs';

export class SmoothAnimation {

    weightAnimations: { weight: number; animation: BABYLON.AnimationGroup }[] = []
    currentAnimation: string = '';

    constructor(private game: Game, private animations: BABYLON.AnimationGroup[]) {
        this.weightAnimations = this.animations.map(anim => ({ weight: 0, animation: anim }))
        for(let wa of this.weightAnimations) {
            wa.animation.start(true)
            wa.animation.setWeightForAllAnimatables(0)
            if(wa.animation.name === 'Idle') { 
                wa.animation.setWeightForAllAnimatables(1)
                wa.weight = 1
            }
            else {
                wa.animation.setWeightForAllAnimatables(0)
                wa.weight = 0
            }
        }
    }

    loop() {
        for(let wa of this.weightAnimations) {
            if(wa.animation.name.toLocaleUpperCase() === this.currentAnimation) {
                wa.weight = BABYLON.Scalar.Clamp(wa.weight + 0.05, 0, 1);
            }
            else {
                wa.weight = BABYLON.Scalar.Clamp(wa.weight - 0.05, 0, 1);
            }
            wa.animation.setWeightForAllAnimatables(wa.weight)
        }
    }

    play(name: string, speed?: number) {
        this.currentAnimation = name
        if(speed) {
            const wa = this.weightAnimations.find(a => a.animation.name.toLocaleUpperCase() === name)
            if(wa) wa.animation.speedRatio = speed
        }
    }

}
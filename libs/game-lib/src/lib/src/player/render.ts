import { Game } from "@winter-sports/game-lib";
import { BasePlayer } from "./player";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class PlayerRenderer {
    mesh?: BABYLON.AbstractMesh;
    animations: BABYLON.AnimationGroup[] = []
    constructor(private game: Game, private player: BasePlayer) {
        BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "pingu.glb", this.game.scene).then(mesh => {
            this.mesh = mesh.meshes[0]
            this.mesh.parent = this.player.collider
            this.mesh.scaling = new BABYLON.Vector3(1, 1, 1)
            this.mesh.locallyTranslate(new BABYLON.Vector3(0, -2, 0))
            this.game.skybox.shadowGenerator.addShadowCaster(this.mesh)
            this.animations = mesh.animationGroups
        })
    }

    render() {
        this.animate()
    }

    animate() {
        this.playAnimation('RUN', this.player.velocity.length() > 0.01, this.player.velocity.length() * 10)
    }

    playAnimation(name: string, condition: boolean, speed?: number) {
        const animation = this.animations.find(a => a.name.toLocaleUpperCase() === name.toLocaleUpperCase())
        if(animation && condition) animation.play(true)
        if(animation && !condition) animation.stop()
        return condition
    }


}
import { Game } from "@winter-sports/game-lib";
import { BasePlayer } from "./player";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { SmoothAnimation } from "../misc/smoothAnimations";
import { map } from "rxjs";

export class PlayerRenderer {
    mesh?: BABYLON.AbstractMesh;
    animations: BABYLON.AnimationGroup[] = []
    animatables?: SmoothAnimation;
    lookAt?: BABYLON.Mesh | BABYLON.Camera;
    HEAD?: BABYLON.TransformNode;
    constructor(private game: Game, private player: BasePlayer) {
        BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "pingu.glb", this.game.scene).then(mesh => {
            this.mesh = mesh.meshes[0]
            this.mesh.parent = this.player.collider
            this.mesh.scaling = new BABYLON.Vector3(1, 1, 1)
            this.mesh.locallyTranslate(new BABYLON.Vector3(0, -2, 0))
            this.game.skybox.shadowGenerator.addShadowCaster(this.mesh)
            this.animations = mesh.animationGroups
            this.animatables = new SmoothAnimation(this.game, this.animations)
            this.HEAD = this.mesh.getChildTransformNodes().find(t => t.name === 'HEAD')
        })
    }

    render(dt: number) {
        this.animate(dt)
        this.animatables?.loop()
        if (this.lookAt && this.HEAD) {
            this.HEAD.lookAt(this.lookAt.position, -Math.PI / 2, 0, 0, BABYLON.Space.WORLD)
            if (this.HEAD.rotationQuaternion!.y > 0.5) this.HEAD.rotationQuaternion!.y = 0
            this.HEAD.rotationQuaternion!.z = 0
            this.HEAD.rotationQuaternion!.x = 0
        }
    }

    animate(dt: number) {
        if (Math.abs(this.player.realGravityVelocity.y) > 0.10)
            this.playAnimation('FALLING')
        else if (this.player.velocity.length() > 0.32)
            this.playAnimation('SPRINT', this.player.velocity.length() * dt / 2)
        else if (this.player.velocity.length() > 0.01)
            this.playAnimation('RUN', this.player.velocity.length() * dt / 2)
        else this.playAnimation('IDLE')
    }

    playAnimation(name: string, speed?: number) {
        if (this.animatables) this.animatables.play(name, speed)
    }

    destroy() {
        for (let animation of this.animations) animation.dispose()
        this.mesh?.dispose()
    }

}
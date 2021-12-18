import { BasePlayer } from "./player";
import * as BABYLON from 'babylonjs'
import { Game } from "@winter-sports/game-lib";

export class PlayerCamera {
    camera: BABYLON.FreeCamera;
    direction: BABYLON.Vector3;

    camHeight = 10
    camDistance = 80

    constructor(private game: Game, private player: BasePlayer) {
        this.camera = new BABYLON.FreeCamera('pCam', new BABYLON.Vector3(this.camDistance, this.camHeight, 0), this.game.scene)
        this.camera.fov = 0.6
        this.direction = new BABYLON.Vector3(0, 0, 0)
    }

    update(dt: number) {
        // this.camera.target = this.player.collider.position
        const targetPosition = this.player.collider.position.add(
            new BABYLON.Vector3(this.camDistance, this.camHeight, 0)
        )

        this.camera.position = this.camera.position.add(new BABYLON.Vector3(
            ((this.player.collider.position.x) + 80 - this.camera.position.x) * dt / 500,
            ((this.player.collider.position.y) + 40 - this.camera.position.y) * dt / 500,
            (this.player.collider.position.z - this.camera.position.z) * dt / 500,
            )
        )
        this.camera.target = this.player.collider.position

        this.direction = targetPosition.subtract(this.player.collider.position).multiplyByFloats(1, 0, 1).normalize()
    }

    destroy() {
        this.camera.dispose()
    }


}
import { Game } from "../game";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class Player {
    game: Game;
    camera: BABYLON.ArcFollowCamera | null = null;
    mesh: BABYLON.AbstractMesh | null = null;
    speed = 0.15;
    index: number;
    constructor(game: Game, index = 0) {
        this.game = game
        this.index = index

        if (index === 0) {
            this.game.scene.registerBeforeRender(() => {
                let vector = new BABYLON.Vector3(
                    this.game.input.isPressed('LEFT') ? -1 : this.game.input.isPressed('RIGHT') ? 1 : 0,
                    0,
                    this.game.input.isPressed('DOWN') ? -1 : this.game.input.isPressed('UP') ? 1 : 0)
                vector = vector.multiplyByFloats(this.speed, this.speed, this.speed)
                if(this.mesh) this.mesh.position = this.mesh.position.add(vector)
            })
        }
        this.init()
    }

    async init() {
        const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "character.glb", this.game.scene)

        this.mesh = meshes.meshes[0]

        const shirt = this.findMaterial('Shirt');
        if(this.index === 0) (shirt as any).albedoColor = new BABYLON.Color3(0.85, 0.1, 0.1);
        else (shirt as any).albedoColor = new BABYLON.Color3(0.1, 0.1, 0.85);
        debugger
    }

    findMaterial(name: string) {
        if (this.mesh) {
            for (let mesh of this.mesh.getChildMeshes()) {
                if (mesh.material?.name === 'Shirt') return mesh.material
            }
        }
        return null

    }


}
import { Game } from "../game";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { Mesh } from "babylonjs/Meshes/mesh";

export class Player {
    game: Game;
    camera: BABYLON.ArcFollowCamera | null = null;
    mesh: BABYLON.AbstractMesh | null = null;
    speed = 0.22;
    height = 5.5;
    index: number;
    collider: BABYLON.Mesh | null = null;

    constructor(game: Game, index = 0) {
        this.game = game
        this.index = index

        this.game.scene.registerBeforeRender(this.loop.bind(this))

        this.init()
    }

    loop() {
        if (this.index === 0) {
            let vector = new BABYLON.Vector3(
                this.game.input.isPressed('LEFT') ? -1 : this.game.input.isPressed('RIGHT') ? 1 : 0, 0,
                this.game.input.isPressed('DOWN') ? -1 : this.game.input.isPressed('UP') ? 1 : 0)

            if (Math.abs(vector.x) + Math.abs(vector.z) === 2) vector = vector.scaleInPlace(this.speed / Math.sqrt(2))
            else vector = vector.scaleInPlace(this.speed)
            if (!vector.equals(new BABYLON.Vector3(0, 0, 0))) this.collider?.lookAt(this.collider.position.subtract(vector))
            if (this.collider) this.collider.position = this.collider.position.add(vector)
        }
    }

    async init() {
        const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "character.glb", this.game.scene)
        this.mesh = meshes.meshes[0]
        this.mesh.scaling = new BABYLON.Vector3(1, 1, 1)
        this.mesh.translate(new BABYLON.Vector3(0, 1, 0), 0)

        this.collider = BABYLON.MeshBuilder.CreateBox('player', { width: 2, height: this.height, depth: 1.3}, this.game.scene)
        this.collider.translate(new BABYLON.Vector3(0, 1, 0), this.height / 2, BABYLON.Space.LOCAL)
        this.collider.physicsImpostor = new BABYLON.PhysicsImpostor(this.collider, BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.1}
        )
        this.collider.isVisible = false
        this.mesh.setParent(this.collider)
        this.game.shadowGenerator.addShadowCaster(this.mesh)

        const shirt = this.findMaterial('Shirt') as BABYLON.StandardMaterial
        shirt.emissiveColor = new BABYLON.Color3(0.2, 0, 0)
        shirt.specularColor = new BABYLON.Color3(0.2, 0, 0)
        shirt.diffuseColor = new BABYLON.Color3(0.2, 0, 0)

        //TODO: switch to this.mesh
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
import { Game } from "../game";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { Mesh } from "babylonjs/Meshes/mesh";

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

                if(Math.abs(vector.x) + Math.abs(vector.z) === 2) vector = vector.scaleInPlace(this.speed / Math.sqrt(2))
                else vector = vector.scaleInPlace(this.speed)
                if(!vector.equals(new BABYLON.Vector3(0, 0, 0))) this.mesh?.lookAt(this.mesh.position.subtract(vector))
                if (this.mesh) this.mesh.position = this.mesh.position.add(vector)
            })
        }
        this.init()
    }

    async init() {
        const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "character.glb", this.game.scene)

        this.mesh = meshes.meshes[0]
        

        // const body = meshes.meshes.find(mesh => mesh.name === 'PLAYER_primitive0')

        const collider = BABYLON.Mesh.CreateCylinder('collision', 6, 2.2, 2.2, 8, 12, this.game.scene)
        // collider.position.y = 5/2
        collider.isVisible = false
        this.mesh.addChild(collider)

        collider!.physicsImpostor = new BABYLON.PhysicsImpostor(collider!, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0}, this.game.scene)
        collider.position.y += 2.8
        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.NoImpostor, { mass: 1 }, this.game.scene);
        
        this.mesh.position.y = 10
        // const physicsRoot = new BABYLON.Mesh("", this.game.scene)
        // physicsRoot.addChild(collider)
        // physicsRoot.addChild(this.mesh)
        // physicsRoot.position.y += 3

        // collider.physicsImpostor = new BABYLON.PhysicsImpostor(collider, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 }, this.game.scene);
        // physicsRoot.physicsImpostor = new BABYLON.PhysicsImpostor(physicsRoot, BABYLON.PhysicsImpostor.NoImpostor, { mass: 1 }, this.game.scene);

        // this.mesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, , 0))

        if(this.mesh && this.index === 0) this.game.setPlayer(this)

        const shirt = this.findMaterial('Shirt');
        if (this.index === 0) (shirt as any).albedoColor = new BABYLON.Color3(0.85, 0.1, 0.1);
        else (shirt as any).albedoColor = new BABYLON.Color3(0.1, 0.1, 0.85);
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
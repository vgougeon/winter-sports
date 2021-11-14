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
                this.game.input.isPressed('RIGHT') ? -1 : this.game.input.isPressed('LEFT') ? 1 : 0, 0,
                this.game.input.isPressed('DOWN') ? -1 : this.game.input.isPressed('UP') ? 1 : 0)

            if (Math.abs(vector.x) + Math.abs(vector.z) === 2) vector = vector.scaleInPlace(this.speed / Math.sqrt(2))
            else vector = vector.scaleInPlace(this.speed)
            if (!vector.equals(new BABYLON.Vector3(0, 0, 0))) this.collider?.lookAt(this.collider.position.subtract(vector))
            if (this.collider) this.collider.position = this.collider.position.add(vector)
        }
        //TEST
        if(this.collider) {
            // this.collider.position.x += 0.01
        }
        //OTHER
        if (true) {
            // if(this.mesh) {
            //     const look = this.mesh.position.subtract(this.mesh.physicsImpostor!.getLinearVelocity()!)
            //     this.mesh.lookAt(
            //         new BABYLON.Vector3(look.x, this.mesh.position.y, look.z)
            //     )
            // }

            // if(this.mesh){
            //     this.mesh.moveWithCollisions(new BABYLON.Vector3(0, 0, 0.01))
            //     // this.mesh.rotationQuaternion!.y = 90
            // }
        }
    }

    async init() {
        const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "character.glb", this.game.scene)

        this.mesh = meshes.meshes[0]

        this.collider = BABYLON.Mesh.CreateCylinder('collision', 6, 2.2, 2.2, 24, 12, this.game.scene)
        this.collider.translate(new BABYLON.Vector3(0, 1.6, 0), 2, BABYLON.Space.LOCAL)
        // this.collider.position = this.mesh.position

        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.NoImpostor, { mass: 1 }, this.game.scene);
        this.collider!.physicsImpostor = new BABYLON.PhysicsImpostor(this.collider!, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0, restitution: 5 }, this.game.scene)
        this.collider.parent = this.mesh
        this.mesh.addChild(this.collider)

        const joint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.LockJoint, { }); 
        this.collider.physicsImpostor.addJoint(this.mesh.physicsImpostor, joint); 

        // this.mesh.rotation = new BABYLON.Vector3(0, 0, 0)
        if (this.mesh && this.index === 0) this.game.setPlayer(this)

        

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
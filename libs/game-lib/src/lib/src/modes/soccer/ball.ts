import { Game, Soccer } from "@winter-sports/game-lib";
import * as BABYLON from 'babylonjs';

export class SoccerBall {
    mesh: BABYLON.Mesh;
    maxSpeed = 140
    constructor(private game: Game, private mode: Soccer) {
        this.mesh = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: 2 })
        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh,
            BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5, restitution: 0.5 }
        )
        this.mesh.position.y = 10

        if(this.game.canvas) this.game.skybox.shadowGenerator.addShadowCaster(this.mesh)

        const ballMaterial = new BABYLON.StandardMaterial("ball", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/amiga.jpg", this.game.scene);
        ballMaterial.ambientTexture = texture
        this.mesh.material = ballMaterial

        const trail = new BABYLON.TrailMesh('ball-trail', this.mesh, this.game.scene, 0.5)
        const sourceMat = new BABYLON.StandardMaterial('sourceMat', this.game.scene);
        sourceMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        sourceMat.specularColor = BABYLON.Color3.White();
        sourceMat.alpha = 0.2
        trail.material = sourceMat;
    }

    update() {
        if(this.mesh.physicsImpostor) {
            this.mesh.physicsImpostor!.setLinearVelocity(this.mesh.physicsImpostor!.getLinearVelocity()!.scale(0.995))
            this.mesh.physicsImpostor!.setAngularVelocity(this.mesh.physicsImpostor!.getAngularVelocity()!.scale(0.995))

            if(this.mesh.physicsImpostor.getLinearVelocity()!.length() > this.maxSpeed) {
                this.mesh.physicsImpostor.setLinearVelocity(
                    this.mesh.physicsImpostor.getLinearVelocity()!.normalize().scale(this.maxSpeed)
                )
            }
        }

        //
        
    }

    destroy() {
        this.mesh.dispose()
    }
}
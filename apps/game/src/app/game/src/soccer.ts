import { Game } from "../game";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class Soccer {
    game: Game;
    ball: BABYLON.Mesh;
    field: BABYLON.Mesh;

    constructor(game: Game) {
        this.game = game

        this.field = this.generateField()
        this.ball = this.generateBall()

        game.scene.registerBeforeRender(this.loop.bind(this))
    }

    loop() {
        if(this.ball.physicsImpostor) {
            this.ball.physicsImpostor.setLinearVelocity(
                this.ball.physicsImpostor.getLinearVelocity()!.scaleInPlace(0.99)
            )

            this.ball.physicsImpostor.setAngularVelocity(
                this.ball.physicsImpostor.getAngularVelocity()!.scaleInPlace(0.995)
            )
        }
        
    }

    generateBall(): BABYLON.Mesh {
        const ball = BABYLON.Mesh.CreateSphere("sphere", 32, 1, this.game.scene);
        ball.position = new BABYLON.Vector3(5, 5, 5);
        ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1, restitution: 1, friction: 1,
        }, this.game.scene);

        const ballMaterial = new BABYLON.StandardMaterial("ball", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/amiga.jpg", this.game.scene);
        ballMaterial.ambientTexture = texture
        ball.material = ballMaterial

        this.game.shadowGenerator.addShadowCaster(ball)

        return ball
    }

    generateField(): BABYLON.Mesh {
        const field = BABYLON.MeshBuilder.CreateBox('field', { width: 150, height: 1, depth: 70 })
        field.physicsImpostor = new BABYLON.PhysicsImpostor(field, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.5,
            friction: 10
        }, this.game.scene);

        const grass = new BABYLON.StandardMaterial("grass", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/pitch.png", this.game.scene);
        texture.uScale = 10
        texture.vScale = 5
        grass.ambientTexture = texture
        field.material = grass
        field.receiveShadows = true
        return field
    }
}
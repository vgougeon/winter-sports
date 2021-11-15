import { Game } from "../game";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class Soccer {
    game: Game;
    ball: BABYLON.Mesh;
    field: BABYLON.Mesh;

    width = 170
    depth = 100
    lineThickness = 1
    center = new BABYLON.Vector3(0, 0, 0)
    borderHeight = 3
    borderThickness = 1

    lines: BABYLON.Mesh[] = []
    borders: BABYLON.Mesh[] = []

    constructor(game: Game) {
        this.game = game

        this.field = this.generateField()
        this.ball = this.generateBall()
        this.generateBorders()

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
        const ball = BABYLON.Mesh.CreateSphere("sphere", 32, 1.5, this.game.scene);
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
        const field = BABYLON.MeshBuilder.CreateBox('field', { width: this.width, height: 1, depth: this.depth })
        field.position.y = -0.51
        field.physicsImpostor = new BABYLON.PhysicsImpostor(field, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.5,
            friction: 10
        }, this.game.scene);

        const grass = new BABYLON.StandardMaterial("grass", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/sand.jpg", this.game.scene);
        texture.uScale = 8
        texture.vScale = 8
        grass.ambientTexture = texture
        field.material = grass
        field.receiveShadows = true
        this.drawLines()
        
        return field
    }

    drawLines() {
        this.lines[0] = BABYLON.MeshBuilder.CreatePlane('line0', { width: this.lineThickness, height: this.depth})
        this.lines[0].rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, Math.PI/2)
        this.lines[0].setParent(this.field)

        this.lines[1] = BABYLON.MeshBuilder.CreateLathe('circle', {
            shape: [new BABYLON.Vector3(0.33, 0, 0), new BABYLON.Vector3(0.35, 0, 0)],
            radius: this.depth / 2,
            tessellation: 64
        })
        //TODO: Replace 0.33 with line thickness calculation
        this.lines[1].rotation = new BABYLON.Vector3(-Math.PI/2 * 2, -Math.PI/2, 0)

        this.lines[2] = BABYLON.MeshBuilder.CreatePlane('line1', { width: this.width, height: this.lineThickness})
        this.lines[2].rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, Math.PI/2)
        this.lines[2].position.z = this.depth/2 - this.lineThickness/2
        this.lines[2].setParent(this.field)

        this.lines[3] = BABYLON.MeshBuilder.CreatePlane('line2', { width: this.width, height: this.lineThickness})
        this.lines[3].rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, Math.PI/2)
        this.lines[3].position.z = -this.depth/2 + this.lineThickness/2
        this.lines[3].setParent(this.field)

        this.lines[4] = BABYLON.MeshBuilder.CreatePlane('line0', { width: this.lineThickness, height: this.depth})
        this.lines[4].rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, Math.PI/2)
        this.lines[4].position.x = -this.width/2 + this.lineThickness/2
        this.lines[4].setParent(this.field)

        this.lines[5] = BABYLON.MeshBuilder.CreatePlane('line0', { width: this.lineThickness, height: this.depth})
        this.lines[5].rotation = new BABYLON.Vector3(Math.PI/2, Math.PI/2, Math.PI/2)
        this.lines[5].position.x = this.width/2 - this.lineThickness/2
        this.lines[5].setParent(this.field)

        this.lines[6] = BABYLON.MeshBuilder.CreateDisc('central_point', { radius: this.lineThickness })
        this.lines[6].rotation = new BABYLON.Vector3(Math.PI/2, 0, Math.PI/2)
        this.lines[6].setParent(this.field)
    }

    generateBorders() {
        const physics = { mass : 0, restitution: 3 }
        this.borders[0] = BABYLON.MeshBuilder.CreateBox('border1', { width: this.width, height: 5, depth: this.borderThickness })
        this.borders[0].position = new BABYLON.Vector3(0, this.borderHeight / 2 , this.depth / 2 + this.borderThickness / 2)
        this.borders[0].physicsImpostor = new BABYLON.PhysicsImpostor(
            this.borders[0], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )

        this.borders[1] = BABYLON.MeshBuilder.CreateBox('border1', { width: this.width, height: 5, depth: this.borderThickness })
        this.borders[1].position = new BABYLON.Vector3(0, this.borderHeight / 2 , - this.depth / 2 - this.borderThickness / 2)
        this.borders[1].physicsImpostor = new BABYLON.PhysicsImpostor(
            this.borders[1], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )
    }
}
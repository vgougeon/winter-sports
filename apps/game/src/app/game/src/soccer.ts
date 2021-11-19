import { Game } from "../gameOld";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class Soccer {
    game: Game;
    ball: BABYLON.Mesh;
    field: BABYLON.Mesh;

    width = 200
    depth = 130
    lineThickness = 1
    center = new BABYLON.Vector3(0, 0, 0)
    borderHeight = 5
    borderThickness = 1
    goalWidth = this.depth / 6
    goalHeight = 13

    ads: BABYLON.VideoTexture;
    adsWide: BABYLON.VideoTexture;

    lines: BABYLON.Mesh[] = []
    borders: BABYLON.Mesh[] = []

    redGoal: BABYLON.Mesh[] = []
    blueGoal: BABYLON.Mesh[] = []

    constructor(game: Game) {
        this.game = game

        this.field = this.generateField()
        this.ball = this.generateBall()
        this.ads = new BABYLON.VideoTexture('video', "assets/video/out.mp4", this.game.scene, undefined, undefined, undefined,
            { autoPlay: false, muted: true, autoUpdateTexture: true, loop: true })
        this.ads.vScale = 0.6
        this.ads.vOffset = 0.15
        this.adsWide = new BABYLON.VideoTexture('video', "assets/video/out.mp4", this.game.scene, undefined, undefined, undefined,
            { autoPlay: false, muted: true, autoUpdateTexture: true, loop: true })
        this.adsWide.vScale = 0.6
        this.adsWide.vOffset = 0.15
        this.adsWide.uScale = 3
        this.game.scene.onPointerDown = () => {
            this.ads.video.play();
            this.adsWide.video.play();
        };

        this.generateBorders()
        this.generateGoals()


        game.scene.registerBeforeRender(this.loop.bind(this))
    }

    loop() {
        if (this.ball.physicsImpostor) {
            this.ball.physicsImpostor.setLinearVelocity(
                this.ball.physicsImpostor.getLinearVelocity()!.scaleInPlace(0.99)
            )

            this.ball.physicsImpostor.setAngularVelocity(
                this.ball.physicsImpostor.getAngularVelocity()!.scaleInPlace(0.995)
            )
        }

        if(this.ball) {
            if(this.ball.position.y < 0.5) {
                this.ball = this.generateBall()
            }
        }
    }

    generateBall(): BABYLON.Mesh {
        const ball = BABYLON.Mesh.CreateSphere("sphere", 32, 2, this.game.scene);
        ball.position = new BABYLON.Vector3(0, 1, 0);
        ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1, restitution: 1, friction: 1,
        }, this.game.scene);

        const ballMaterial = new BABYLON.StandardMaterial("ball", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/amiga.jpg", this.game.scene);
        ballMaterial.ambientTexture = texture
        ball.material = ballMaterial

        
        this.game.shadowGenerator.addShadowCaster(ball)
        ball.applyImpulse(new BABYLON.Vector3(0, 50, 0), new BABYLON.Vector3(0, 0, 0))

        return ball
    }

    generateField(): BABYLON.Mesh {
        const field = BABYLON.MeshBuilder.CreateBox('field', { width: this.width, height: 1, depth: this.depth })
        field.position.y = -0.51
        field.physicsImpostor = new BABYLON.PhysicsImpostor(field, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 1,
            friction: 10
        }, this.game.scene);

        const grass = new BABYLON.StandardMaterial("grass", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/clay.jpg", this.game.scene);
        texture.uScale = 8
        texture.vScale = 8
        grass.ambientTexture = texture
        field.material = grass
        field.receiveShadows = true
        this.drawLines()

        return field
    }

    drawLines() {
        this.lines[0] = BABYLON.MeshBuilder.CreatePlane('line0', { width: this.lineThickness, height: this.depth })
        this.lines[0].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        this.lines[0].setParent(this.field)

        this.lines[1] = BABYLON.MeshBuilder.CreateLathe('circle', {
            shape: [new BABYLON.Vector3(0.33, 0, 0), new BABYLON.Vector3(0.35, 0, 0)],
            radius: this.depth / 2,
            tessellation: 64
        })
        //TODO: Replace 0.33 with line thickness calculation
        this.lines[1].rotation = new BABYLON.Vector3(-Math.PI / 2 * 2, -Math.PI / 2, 0)

        this.lines[2] = BABYLON.MeshBuilder.CreatePlane('line1', { width: this.width, height: this.lineThickness })
        this.lines[2].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        this.lines[2].position.z = this.depth / 2 - this.lineThickness / 2
        this.lines[2].setParent(this.field)

        this.lines[3] = BABYLON.MeshBuilder.CreatePlane('line2', { width: this.width, height: this.lineThickness })
        this.lines[3].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        this.lines[3].position.z = -this.depth / 2 + this.lineThickness / 2
        this.lines[3].setParent(this.field)

        this.lines[4] = BABYLON.MeshBuilder.CreatePlane('line0', { width: this.lineThickness, height: this.depth })
        this.lines[4].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        this.lines[4].position.x = -this.width / 2 + this.lineThickness / 2
        this.lines[4].setParent(this.field)

        this.lines[5] = BABYLON.MeshBuilder.CreatePlane('line0', { width: this.lineThickness, height: this.depth })
        this.lines[5].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        this.lines[5].position.x = this.width / 2 - this.lineThickness / 2
        this.lines[5].setParent(this.field)

        this.lines[6] = BABYLON.MeshBuilder.CreateDisc('central_point', { radius: this.lineThickness })
        this.lines[6].rotation = new BABYLON.Vector3(Math.PI / 2, 0, Math.PI / 2)
        this.lines[6].setParent(this.field)
    }

    generateBorders() {
        const physics = { mass: 0, restitution: 1 }

        //SIDES
        this.borders[0] = BABYLON.MeshBuilder.CreateBox('border1', { width: this.width, height: this.borderHeight, depth: this.borderThickness })
        this.borders[0].position = new BABYLON.Vector3(0, this.borderHeight / 2, this.depth / 2 + this.borderThickness / 2)
        this.borders[0].physicsImpostor = new BABYLON.PhysicsImpostor(
            this.borders[0], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )

        this.borders[1] = BABYLON.MeshBuilder.CreateBox('border1', { width: this.width, height: this.borderHeight, depth: this.borderThickness })
        this.borders[1].position = new BABYLON.Vector3(0, this.borderHeight / 2, - this.depth / 2 - this.borderThickness / 2)
        this.borders[1].rotation.z = Math.PI
        this.borders[1].physicsImpostor = new BABYLON.PhysicsImpostor(
            this.borders[1], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )

        //GOAL EDGES
        this.borders[2] = BABYLON.MeshBuilder.CreateBox('border2',
            { width: (this.depth - this.goalWidth) / 2, height: this.borderHeight, depth: this.borderThickness }
        )
        this.borders[2].position = new BABYLON.Vector3(
            - this.width / 2 - this.borderThickness / 2,
            this.borderHeight / 2,
            (- this.goalWidth / 2) - (this.depth - this.goalWidth) / 4
        )
        this.borders[2].rotation.y = Math.PI / 2
        this.borders[2].rotation.z = Math.PI
        this.borders[2].physicsImpostor = new BABYLON.PhysicsImpostor(
            this.borders[2], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )

        this.borders[3] = BABYLON.MeshBuilder.CreateBox('border2',
            { width: (this.depth - this.goalWidth) / 2, height: this.borderHeight, depth: this.borderThickness }
        )
        this.borders[3].position = new BABYLON.Vector3(
            - this.width / 2 - this.borderThickness / 2,
            this.borderHeight / 2,
            (this.goalWidth / 2) + (this.depth - this.goalWidth) / 4
        )
        this.borders[3].rotation.y = Math.PI / 2
        this.borders[3].rotation.z = Math.PI
        this.borders[3].physicsImpostor = new BABYLON.PhysicsImpostor(
            this.borders[3], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )

        this.borders[4] = BABYLON.MeshBuilder.CreateBox('border2',
            { width: (this.depth - this.goalWidth) / 2, height: this.borderHeight, depth: this.borderThickness }
        )
        this.borders[4].position = new BABYLON.Vector3(
            this.width / 2 + this.borderThickness / 2,
            this.borderHeight / 2,
            (this.goalWidth / 2) + (this.depth - this.goalWidth) / 4
        )
        this.borders[4].rotation.y = Math.PI / 2
        this.borders[4].physicsImpostor = new BABYLON.PhysicsImpostor(
            this.borders[4], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )

        this.borders[5] = BABYLON.MeshBuilder.CreateBox('border2',
            { width: (this.depth - this.goalWidth) / 2, height: this.borderHeight, depth: this.borderThickness }
        )
        this.borders[5].position = new BABYLON.Vector3(
            this.width / 2 + this.borderThickness / 2,
            this.borderHeight / 2,
            (- this.goalWidth / 2) - (this.depth - this.goalWidth) / 4
        )
        this.borders[5].rotation.y = Math.PI / 2
        this.borders[5].physicsImpostor = new BABYLON.PhysicsImpostor(
            this.borders[5], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )

        const material = new BABYLON.StandardMaterial("ads", this.game.scene);
        material.diffuseTexture = this.ads
        material.roughness = 1;

        const wideMaterial = new BABYLON.StandardMaterial("adsWide", this.game.scene);
        wideMaterial.diffuseTexture = this.adsWide
        wideMaterial.roughness = 1;
        


        this.borders[5].material = material
        this.borders[4].material = material
        this.borders[3].material = material
        this.borders[2].material = material
        this.borders[1].material = wideMaterial
        this.borders[0].material = wideMaterial
    }

    generateGoals() {
        this.redGoal[0] = BABYLON.MeshBuilder.CreateCylinder('redpost1', { height: this.goalHeight, diameter: 1.5, tessellation: 8 })
        this.redGoal[0].position = new BABYLON.Vector3(this.width / 2, this.goalHeight / 2 - 1, this.goalWidth / 2)
        this.redGoal[0].physicsImpostor = new BABYLON.PhysicsImpostor(this.redGoal[0], BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 })

        this.redGoal[1] = BABYLON.MeshBuilder.CreateCylinder('redpost2', { height: this.goalHeight, diameter: 1.5, tessellation: 8 })
        this.redGoal[1].position = new BABYLON.Vector3(this.width / 2, this.goalHeight / 2 - 1, - this.goalWidth / 2)
        this.redGoal[1].physicsImpostor = new BABYLON.PhysicsImpostor(this.redGoal[1], BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 })

        this.redGoal[2] = BABYLON.MeshBuilder.CreateCylinder('redcrossbar', { height: this.goalWidth, diameter: 1.5, tessellation: 8 })
        this.redGoal[2].position = new BABYLON.Vector3(this.width / 2, this.goalHeight - 1, 0)
        this.redGoal[2].rotation.x = Math.PI / 2

        this.blueGoal[0] = BABYLON.MeshBuilder.CreateCylinder('bluepost1', { height: this.goalHeight, diameter: 1.5, tessellation: 8 })
        this.blueGoal[0].position = new BABYLON.Vector3(-this.width / 2, this.goalHeight / 2 - 1, this.goalWidth / 2)
        this.blueGoal[0].physicsImpostor = new BABYLON.PhysicsImpostor(this.blueGoal[0], BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 })

        this.blueGoal[1] = BABYLON.MeshBuilder.CreateCylinder('bluepost2', { height: this.goalHeight, diameter: 1.5, tessellation: 8 })
        this.blueGoal[1].position = new BABYLON.Vector3(-this.width / 2, this.goalHeight / 2 - 1, - this.goalWidth / 2)
        this.blueGoal[1].physicsImpostor = new BABYLON.PhysicsImpostor(this.blueGoal[1], BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 })

        this.blueGoal[2] = BABYLON.MeshBuilder.CreateCylinder('bluecrossbar', { height: this.goalWidth, diameter: 1.5, tessellation: 8 })
        this.blueGoal[2].position = new BABYLON.Vector3(-this.width / 2, this.goalHeight - 1, 0)
        this.blueGoal[2].rotation.x = Math.PI / 2
    }
}
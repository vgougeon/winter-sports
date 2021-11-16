import { Game } from "../game";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class Player {
    game: Game;
    camera: BABYLON.FreeCamera | null = null;
    mesh: BABYLON.AbstractMesh | null = null;
    speed = 0.05;
    height = 5.5;
    index: number;
    collider: BABYLON.Mesh | null = null;

    cameraHeight = 20
    cameraDistance = 40

    acceleration = new BABYLON.Vector3(0, 0, 0)
    velocity = new BABYLON.Vector3(0, 0, 0)

    animations: BABYLON.AnimationGroup[] = []

    constructor(game: Game, index = 0) {
        this.game = game
        this.index = index

        this.game.scene.registerBeforeRender(this.loop.bind(this))

        this.init()
    }

    loop() {
        if (this.index === 0) {
            this.acceleration = new BABYLON.Vector3(
                this.game.input.isPressed('DOWN') * -1 + this.game.input.isPressed('UP'), 0,
                this.game.input.isPressed('RIGHT') * -1 + this.game.input.isPressed('LEFT')
            )
            if (Math.abs(this.acceleration.x) + Math.abs(this.acceleration.z) === 2) { 
                this.acceleration = this.acceleration.scaleInPlace(this.speed / Math.sqrt(2))
            }
            else this.acceleration = this.acceleration.scaleInPlace(this.speed)
            this.velocity = this.velocity.add(this.acceleration)
            if (!this.velocity.equals(new BABYLON.Vector3(0, 0, 0))) this.collider?.lookAt(this.collider.position.subtract(this.velocity))
            if(this.collider) this.collider.moveWithCollisions(this.velocity)
            this.velocity = this.velocity.scaleInPlace(0.8)
            if(this.animations[2]) {
                if(Math.abs(this.velocity.length()) > 0.05) {
                    this.animations[2].speedRatio = (Math.abs(this.velocity.length())) * 5
                    this.animations[2].play(true)
                }
                else this.animations[2].stop()
            }
            
        }

        //LOOK AT THE BALL
        if(this.mesh) {
            const [HEAD] = this.mesh!.getChildTransformNodes(undefined, (node) => node.name === 'HEAD')
            HEAD.scaling = new BABYLON.Vector3(1, 1, 1)
            // HEAD.rotation = new BABYLON.Vector3(-Math.PI / 2, 0.8, Math.PI / 2)

            if(this.game.sport && this.game.sport.ball) {
                //FIND BALL ANGLE
                // const headPosition = HEAD.position
                // const ballPosition = this.game.sport.ball.position
                // const playerDirection = this.velocity

                //TODO: Find equation

                // HEAD.rotateAround(HEAD.position, new BABYLON.Vector3(1, 0, 0), 0.8)
            }
        }
    }

    async init() {
        const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "character.glb", this.game.scene)
        this.animations = meshes.animationGroups
        this.mesh = meshes.meshes[0]
        this.mesh.beginAnimation('Run', true)
        this.mesh.scaling = new BABYLON.Vector3(1, 1, 1)
        this.mesh.translate(new BABYLON.Vector3(0, 1, 0), 0)

        this.collider = BABYLON.MeshBuilder.CreateBox('player_collider', { width: 2, height: this.height, depth: 1.3}, this.game.scene)
        this.collider.translate(new BABYLON.Vector3(0, 1, 0), this.height / 2, BABYLON.Space.LOCAL)
        
        this.collider.isVisible = false
        this.mesh.setParent(this.collider)
        this.collider.position = new BABYLON.Vector3(10, this.height / 2, 0)
        this.collider.physicsImpostor = new BABYLON.PhysicsImpostor(this.collider, BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 1.3}
        )
        this.game.shadowGenerator.addShadowCaster(this.mesh)

        const shirt = this.findMaterial('Shirt') as BABYLON.StandardMaterial
        shirt.emissiveColor = new BABYLON.Color3(0.2, 0, 0)
        shirt.specularColor = new BABYLON.Color3(0.2, 0, 0)
        shirt.diffuseColor = new BABYLON.Color3(0.2, 0, 0)

        this.createCamera()
        if(this.index === 0) this.game.setPlayer(this)
    }

    findMaterial(name: string) {
        if (this.mesh) {
            for (let mesh of this.mesh.getChildMeshes()) {
                if (mesh.material?.name === name) return mesh.material
            }
        }
        return null
    }

    createCamera() {
        this.camera = new BABYLON.FreeCamera('player_camera', new BABYLON.Vector3(-this.cameraDistance, this.cameraHeight, 0), this.game.scene)
        this.camera.lockedTarget = this.collider
        this.camera.fov = 0.8
        this.game.scene.registerBeforeRender(() => {
            if(this.camera && this.collider) {
                this.camera.position.x = this.collider.position.x - this.cameraDistance
                this.camera.position.z = this.collider.position.z
            }
            // if(this.camera && this.game.sport!.ball) {
            //     this.camera.position.x = this.game.sport!.ball.position.x - this.cameraDistance
            //     this.camera.position.z = this.game.sport!.ball.position.z
            // }
        })
    }


}
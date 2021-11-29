import { Game } from "../game-lib";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { IPlayerState } from "../interfaces";
import { IInputMap, Soccer } from '@winter-sports/game-lib';

export class Player {
    game: Game;
    camera: BABYLON.FreeCamera | null = null;
    mesh: BABYLON.AbstractMesh | null = null;
    speed = 0.12;
    height = 4.7;
    state: IPlayerState;
    collider: BABYLON.Mesh | null = null;

    cameraHeight = 20
    cameraDistance = 40

    stamina = 100

    currentInputs: IInputMap = {};

    acceleration = new BABYLON.Vector3(0, 0, 0)
    velocity = new BABYLON.Vector3(0, 0, 0)

    animations: BABYLON.AnimationGroup[] = []

    loopCall = this.loop.bind(this)

    constructor(game: Game, state: IPlayerState) {
        this.game = game
        this.state = state
        if (this.state.id === this.game.playerId) this.game.setSelf(this)

        // this.game.scene.registerBeforeRender(this.loopCall)
        this.game.scene.onBeforePhysicsObservable.add(this.loopCall)

        this.init()
    }

    loop() {
        if (!this.game.options.isServer && this.state.id === 'self') this.currentInputs = this.game.currentInputs

        let m = this.state.teamId === 0 ? 1 : -1

        this.acceleration = new BABYLON.Vector3(
            (this.currentInputs['DOWN'] || 0) * -1 * m + (this.currentInputs['UP'] || 0) * m, 0,
            (this.currentInputs['RIGHT'] || 0) * -1 * m + (this.currentInputs['LEFT'] || 0) * m
        )
        //TODO: keep acceleration on frame drop
        if (Math.abs(this.acceleration.x) + Math.abs(this.acceleration.z) === 2) {
            this.acceleration = this.acceleration.scaleInPlace(this.speed / Math.sqrt(2))
        }
        else this.acceleration = this.acceleration.scaleInPlace(this.speed)
        this.velocity = this.velocity.add(this.acceleration)
        if (this.velocity.length() > 0.05) this.collider?.lookAt(this.collider.position.subtract(this.velocity))
        if (this.collider) this.collider.moveWithCollisions(this.velocity)
        this.velocity = this.velocity.scaleInPlace(0.80)

        if (this.camera && this.collider) {
            this.camera.position.x = this.collider.position.x - this.cameraDistance * m
            this.camera.position.z = this.collider.position.z
        }

        if (this.currentInputs['A']) this.collider!.physicsImpostor!.restitution = 1.8;
        else if (this.currentInputs['B']) this.collider!.physicsImpostor!.restitution = 2.5;
        else if (this.currentInputs['LB']) this.collider!.physicsImpostor!.restitution = 0.2;
        else this.collider!.physicsImpostor!.restitution = 1;

        if (this.currentInputs['RIGHT_TRIGGER'] && this.stamina > 0.5) {
            this.speed = 0.13
            this.stamina -= 0.5
        }
        else {
            this.speed = 0.10
            this.stamina += 0.25
        }

        if (!this.game.options.isServer) this.animate()
    }

    animate() {
        const RUN = this.animations.find(a => a.name === 'Run')
        if (RUN) {
            // if (Math.abs(this.acceleration.length()) > 0.001) {
            //     RUN.speedRatio = (Math.abs(this.acceleration.length())) * 15
            //     RUN.play(true)
            // }
            // else RUN.stop()
            if (Math.abs(this.velocity.length()) > 0.01) {
                RUN.speedRatio = (Math.abs(this.velocity.length())) * 5
                RUN.play(true)
            }
            else RUN.stop()
        }
        if(this.mesh) {
            // const [HEAD] = this.mesh!.getChildTransformNodes(undefined, (node) => node.name === 'HEAD')
            // HEAD.scaling = new BABYLON.Vector3(2, 2, 2)
        }
        
    }

    getKickoffPosition() {
        if (this.game.mode instanceof Soccer) {
            const mates = this.game.players.filter(p => p.state.teamId === this.state.teamId)
            let m = this.state.teamId === 0 ? -1 : 1
            let width = this.game.mode?.width || 30
            let depth = this.game.mode?.depth || 20
            return new BABYLON.Vector3(
                mates.length < 1 ? width / 4 * m : width / 3 * m,
                this.height / 2,
                mates.length < 1 ? 0 : mates.length === 1 ? depth / 4 : -depth / 4
            )
        }
        return new BABYLON.Vector3(0, 0, 0)
    }

    async init() {
        //TODO: if this is late, socket will CRASH !!!!!!
        this.collider = BABYLON.MeshBuilder.CreateBox('player_collider', { width: 2, height: this.height, depth: 1.3 }, this.game.scene)
        this.collider.translate(new BABYLON.Vector3(0, 1, 0), this.height / 2, BABYLON.Space.LOCAL)

        this.collider.isVisible = true
        this.collider.position = this.getKickoffPosition()
        this.collider.physicsImpostor = new BABYLON.PhysicsImpostor(this.collider, BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 1.3 }
        )

        if (!this.game.options.isServer) {
            const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "pingu.glb", this.game.scene)
            this.animations = meshes.animationGroups
            this.mesh = meshes.meshes[0]
            this.mesh.scaling = new BABYLON.Vector3(1, 1, 1)
            this.mesh.position = this.collider.position

            this.mesh.parent = this.collider
            this.mesh.setPositionWithLocalVector(new BABYLON.Vector3(0, -this.height / 2, 0))
            this.game.shadowGenerator.addShadowCaster(this.collider)
            let color = new BABYLON.Color3(0.15, 0, 0)
            if (this.state.teamId === 1) color = new BABYLON.Color3(0, 0, 0.15)
            const shirt = this.findMaterial('BlackPenguin') as BABYLON.StandardMaterial
            if (shirt) shirt.emissiveColor = color

        }

        this.createCamera()
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
        let m = this.state.teamId === 0 ? 1 : -1
        if (this.camera && this.collider) {
            this.camera.position.x = this.collider.position.x - this.cameraDistance * m
            this.camera.position.z = this.collider.position.z
        }
        if (this.game.playerId === this.state.id) {
            this.game.followPlayer(this)
        }
    }


    destroy() {
        this.collider?.dispose()
        this.mesh?.dispose()
        this.camera?.dispose()
        this.game.scene.unregisterBeforeRender(this.loopCall)
    }

}
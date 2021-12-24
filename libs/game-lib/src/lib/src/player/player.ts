import { Game } from "../../game-lib";
import * as BABYLON from 'babylonjs';
import { PlayerRenderer } from "./render";
import { IInputMap } from "../../interfaces";
import { PlayerCamera } from "./camera";
import { PlayerNameplate } from './nameplate';

export class BasePlayer {
    public id?: string;
    public pseudo?: string;
    public collider!: BABYLON.Mesh;
    serverPosition?: BABYLON.Vector3;
    renderer!: PlayerRenderer;
    camera!: PlayerCamera;
    inputs: IInputMap = {};
    acceleration = new BABYLON.Vector3(0, 0, 0);
    velocity = new BABYLON.Vector3(0, 0, 0);
    gravityVelocity = new BABYLON.Vector3(0, 0, 0);
    realGravityVelocity = new BABYLON.Vector3(0, 0, 0);
    nameplate!: PlayerNameplate;
    private deltaSpeed = 180
    private sprintDeltaSpeed = 120
    loopCall = this.loop.bind(this)

    constructor(private game: Game) { this.init() }

    destroy() {
        this.game.scene.unregisterBeforeRender(this.loopCall)
        this.collider?.dispose()
        if(this.renderer) this.renderer.destroy()
        this.camera.destroy()
    }

    init() {
        this.collider = BABYLON.MeshBuilder.CreateBox('player_collider', { width: 2.5, height: 4, depth: 1.7 }, this.game.scene)
        this.collider.ellipsoid = new BABYLON.Vector3(1, 2, 0.7);
        this.collider.isVisible = false
        this.collider.checkCollisions = true
        this.collider.physicsImpostor = new BABYLON.PhysicsImpostor(this.collider, BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 2 })
        if (this.game.canvas) {
            this.game.skybox.shadowGenerator.addShadowCaster(this.collider)
            this.renderer = new PlayerRenderer(this.game, this)
            this.nameplate = new PlayerNameplate(this.game, this)
        }
        this.game.scene.registerBeforeRender(this.loopCall)
        this.camera = new PlayerCamera(this.game, this)
    }

    loop() {
        const dt = this.game.engine.getDeltaTime()

        const initialPosition = this.collider.position.clone()

        if (this.id === 'SELF' || this.id === this.game.selfId) { this.inputs = this.game.input?.getInputs() || {} }
        const X = (this.inputs['UP'] || 0) * -1 + (this.inputs['DOWN'] || 0) * 1
        const Z = (this.inputs['RIGHT'] || 0) * 1 + (this.inputs['LEFT'] || 0) * -1

        this.acceleration = new BABYLON.Vector3(X, 0, Z)
        if (this.acceleration.length() > 1) this.acceleration = this.acceleration.normalize()
        if (this.inputs['RIGHT_TRIGGER']) this.acceleration = this.acceleration.scaleInPlace(dt / this.sprintDeltaSpeed)
        else this.acceleration = this.acceleration.scaleInPlace(dt / this.deltaSpeed)

        this.velocity = this.velocity.add(this.acceleration)


        if (this.velocity.length() > 0.001) this.collider.lookAt(this.collider.position.subtract(this.velocity))

        if (this.inputs['A'] && this.realGravityVelocity.y === 0) {
            this.realGravityVelocity.y = 0.4
        }
        //GRAVITY
        this.gravityVelocity = new BABYLON.Vector3(0, this.realGravityVelocity.y - 0.01, 0)
        this.collider.moveWithCollisions(this.velocity)
        this.collider.moveWithCollisions(this.gravityVelocity)

        if(this.renderer) this.renderer.render(dt)
        this.camera.update(dt)

        this.realGravityVelocity = this.collider.position.subtract(initialPosition).maximizeInPlaceFromFloats(0, -2, 0).scaleInPlace(0.99)

        this.velocity = this.velocity.scaleInPlace(0.85)
        // this.gravityVelocity = this.gravityVelocity.scaleInPlace(0.80)
        if(this.serverPosition) {
            const distance = this.serverPosition.subtract(this.collider.position)
            this.collider.position = this.collider.position.add(distance.scale(0.1))
        }
    }

    setSelf() {
        this.game.scene.switchActiveCamera(this.camera.camera)
    }

    setId(id: string) {
        this.id = id
        console.debug(this.id, this.game.selfId)
        if(this.id === this.game.selfId || this.id === 'SELF') this.game.scene.switchActiveCamera(this.camera.camera)
    }

    setPseudo(pseudo: string) {
        this.pseudo = pseudo
    }

}
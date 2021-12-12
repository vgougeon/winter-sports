import { Game } from "../../game-lib";
import * as BABYLON from 'babylonjs';
import { PlayerRenderer } from "./render";
import { IInputMap } from "../../interfaces";

export class BasePlayer {
    collider!: BABYLON.Mesh;
    renderer!: PlayerRenderer;
    inputs?: IInputMap;
    acceleration = new BABYLON.Vector3(0, 0, 0);
    velocity = new BABYLON.Vector3(0, 0, 0);
    gravityVelocity = new BABYLON.Vector3(0, 0, 0);
    realGravityVelocity = new BABYLON.Vector3(0, 0, 0);
    loopCall = this.loop.bind(this)

    constructor(private game: Game) { this.init() }
    destroy() { this.collider?.dispose() }

    init() {
        this.collider = BABYLON.MeshBuilder.CreateBox('player_collider', { width: 2, height: 4, depth: 1.3 }, this.game.scene)
        this.collider.ellipsoid = new BABYLON.Vector3(1, 2, 0.7);
        this.collider.isVisible = false
        this.game.skybox.shadowGenerator.addShadowCaster(this.collider)
        this.renderer = new PlayerRenderer(this.game, this)
        this.game.scene.registerBeforeRender(this.loopCall)
    }

    loop() {

        const initialPosition = this.collider.position.clone()

        this.inputs = this.game.input?.getInputs() || {}
        console.log(this.inputs)
        const Z = (this.inputs['UP'] || 0) * 1 + (this.inputs['DOWN'] || 0) * -1
        const X = (this.inputs['RIGHT'] || 0) * 1 + (this.inputs['LEFT'] || 0) * -1

        this.acceleration = new BABYLON.Vector3(X, 0, Z).normalize().scaleInPlace(0.05)
        this.velocity = this.velocity.add(this.acceleration)
        
        
        if (this.velocity.length() > 0.001) this.collider.lookAt(this.collider.position.subtract(this.velocity))


        
        //GRAVITY
        this.gravityVelocity = new BABYLON.Vector3(0, this.realGravityVelocity.y - 0.01, 0)
        this.collider.moveWithCollisions(this.velocity)
        this.collider.moveWithCollisions(this.gravityVelocity)

        this.renderer.render()

        this.realGravityVelocity = this.collider.position.subtract(initialPosition).maximizeInPlaceFromFloats(0, -2, 0).scaleInPlace(0.99)
        
        this.velocity = this.velocity.scaleInPlace(0.85)
        // this.gravityVelocity = this.gravityVelocity.scaleInPlace(0.80)

        

    }

    

}
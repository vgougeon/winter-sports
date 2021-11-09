import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { Player } from './src/player';
import * as CANNON from 'cannon'
import { Soccer } from './src/soccer';
import { Input } from './src/input';
window.CANNON = CANNON

export class Game {
    scene: BABYLON.Scene
    engine: BABYLON.Engine
    camera: BABYLON.Camera
    light: BABYLON.HemisphericLight

    player: Player | null = null;
    players: Player[] = []

    sport: Soccer;

    input: Input;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas, true)
        this.scene = new BABYLON.Scene(this.engine)
        this.scene.enablePhysics(new BABYLON.Vector3(0,-9.81, 0), new BABYLON.CannonJSPlugin())
        // this.camera = new BABYLON.FreeCamera('main', new BABYLON.Vector3(0, 5, -10), this.scene);
        this.camera = new BABYLON.ArcRotateCamera('main', -Math.PI/2, 1.58, 10, new BABYLON.Vector3(0, 1, 0), this.scene)
        this.camera.attachControl(canvas, true)
        // this.scene.createDefaultCamera(true, true, true)

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 5, 0), this.scene);
        
        this.sport = new Soccer(this)
        this.players = [new Player(this, 0)]
        

        this.input = new Input(this)
        this.scene.debugLayer.show();

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }


    model() {
        this.player = new Player(this)
    }

    setPlayer(player: Player) {
        this.player = player
        // this.camera = new BABYLON.ArcFollowCamera('follow', -Math.PI/4, 1.58, 10, this.player.mesh, this.scene)
        this.camera = new BABYLON.FollowCamera('follow', new BABYLON.Vector3(5, 5, 5), this.scene, player.mesh);
        (this.camera as BABYLON.FollowCamera).noRotationConstraint = true
    }
}
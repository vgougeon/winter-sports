import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { SkyMaterial } from '@babylonjs/materials';
import { Player } from './src/player';
import * as CANNON from 'cannon'
import { Soccer } from './src/soccer';
import { Input } from './src/input';

window.CANNON = CANNON
export class Game {
    scene: BABYLON.Scene
    engine: BABYLON.Engine
    camera: BABYLON.Camera
    hemisphericLight: BABYLON.HemisphericLight;
    light: BABYLON.DirectionalLight
    shadowGenerator: BABYLON.ShadowGenerator;

    player: Player | null = null;
    players: Player[] = []

    sport: Soccer | null = null;
    input: Input;
    gamepad: BABYLON.GamepadManager;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas, true)
        this.scene = new BABYLON.Scene(this.engine)
        this.canvas = canvas
        this.camera = new BABYLON.ArcRotateCamera('main', -Math.PI / 2, 1.58, 10, new BABYLON.Vector3(0, 1, 0), this.scene)
        this.camera.attachControl(canvas, true)


        this.hemisphericLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 2, 0), this.scene);
        this.hemisphericLight.intensity = 0.85

        this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), this.scene);
        this.light.intensity = 1
        this.light.position = new BABYLON.Vector3(20, 40, 20);
        this.shadowGenerator = new BABYLON.ShadowGenerator(10000, this.light)

        this.init()
        this.generateSkybox()

        this.gamepad = new BABYLON.GamepadManager()
        this.input = new Input(this)
        
        this.scene.debugLayer.show();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }


    async init() {
        this.scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.AmmoJSPlugin())

        this.sport = new Soccer(this)
        this.players = [new Player(this, 0)]
    }

    generateSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 500}, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/sunny", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        // const skyboxMaterial = new SkyMaterial("skyMaterial", this.scene as any);
        // skyboxMaterial.backFaceCulling = false;
        // skyboxMaterial.inclination = 0;
        // skyboxMaterial.luminance = 50;
        // //skyboxMaterial._cachedDefines.FOG = true;

        // const skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, this.scene);
        // (skybox.material as any) = skyboxMaterial;
    }

    model() {
        this.player = new Player(this)
    }

    setPlayer(player: Player) {
        this.player = player
        if(this.player.camera) this.scene.switchActiveCamera(this.player.camera, true)
    }
}
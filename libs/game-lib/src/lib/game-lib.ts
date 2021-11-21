import * as BABYLON from 'babylonjs';
import Ammo from 'ammo.js'
import { Soccer } from './src/soccer';
import { IGameOptions } from '..';
import { IGameMode } from './interfaces';

export class Game {
  canvas?: HTMLCanvasElement
  scene: BABYLON.Scene
  engine: BABYLON.Engine
  camera: BABYLON.Camera
  hemisphericLight: BABYLON.HemisphericLight;
  light: BABYLON.DirectionalLight
  shadowGenerator: BABYLON.ShadowGenerator;

  gameMode: IGameMode | null = null
  sport: Soccer | null = null;
  options: IGameOptions

  constructor(engine: BABYLON.Engine, options: IGameOptions = {}) {
    this.engine = engine
    this.scene = new BABYLON.Scene(this.engine)
    this.camera = new BABYLON.ArcRotateCamera('main', -Math.PI / 2, 1.58, 10, new BABYLON.Vector3(0, 1, 0), this.scene)
    if (options.canvas) {
      this.canvas = options.canvas
      this.camera.attachControl(this.canvas)
    }
    this.options = options

    this.hemisphericLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 2, 0), this.scene);
    this.hemisphericLight.intensity = 0.7

    this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), this.scene);
    this.light.intensity = 1
    this.light.position = new BABYLON.Vector3(20, 40, 20);
    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light)

    if(!this.options.isServer) this.generateSkybox()

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  async init() {
    const ammo = await Ammo()
    this.scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.AmmoJSPlugin(true, ammo))
    debugger
  }

  async startGameMode(gamemode: IGameMode) {
    debugger
    switch (gamemode.name) {
      case 'Soccer':
        this.sport = new Soccer(this);
        break;
    }
  }

  generateSkybox() {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 750 }, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/sunny", this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
  }
}

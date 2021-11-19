import * as BABYLON from 'babylonjs';
import Ammo from 'ammo.js'
import { Soccer } from './src/soccer';

export class Game {
  canvas?: HTMLCanvasElement
  scene: BABYLON.Scene
  engine: BABYLON.Engine
  camera: BABYLON.Camera
  hemisphericLight: BABYLON.HemisphericLight;
  light: BABYLON.DirectionalLight
  shadowGenerator: BABYLON.ShadowGenerator;

  sport: Soccer | null = null;

  constructor(engine: BABYLON.Engine, canvas?: HTMLCanvasElement) {
    this.engine = engine
    this.scene = new BABYLON.Scene(this.engine)
    this.camera = new BABYLON.ArcRotateCamera('main', -Math.PI / 2, 1.58, 10, new BABYLON.Vector3(0, 1, 0), this.scene)
    if (canvas) {
      this.canvas = canvas
      this.camera.attachControl(canvas)
    }

    this.hemisphericLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 2, 0), this.scene);
    this.hemisphericLight.intensity = 0.7

    this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), this.scene);
    this.light.intensity = 1
    this.light.position = new BABYLON.Vector3(20, 40, 20);
    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light)

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    this.init()
  }

  async init() {
    const ammo = await Ammo()
    this.scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.AmmoJSPlugin(true, ammo))

    this.sport = new Soccer(this)
  }
}

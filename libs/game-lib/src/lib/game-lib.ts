import * as BABYLON from 'babylonjs';
import Ammo from 'ammo.js';
import { IGameOptions } from '..';
import { Input } from './src/input';
import { IInputMap } from '@winter-sports/game-lib';
import { Playground } from './src/modes/playground/playground';
import { Skybox } from './src/misc/skybox';
import { Soccer } from './src/modes/soccer/soccer';
import { BehaviorSubject } from 'rxjs';
BABYLON.Animation.AllowMatricesInterpolation = true;
export class Game {
  canvas?: HTMLCanvasElement
  server: boolean = false;
  scene!: BABYLON.Scene
  camera!: BABYLON.Camera
  skybox!: Skybox;
  shadowGenerator?: BABYLON.ShadowGenerator;
  assetsManager: BABYLON.AssetsManager;
  assets: {
    meshes: Record<string, BABYLON.MeshAssetTask>
  } = { meshes: {} }

  input?: Input;
  currentInputs: IInputMap = {};

  mode?: Playground | any;
  assetsReady: BehaviorSubject<boolean>;

  constructor(public engine: BABYLON.Engine, public options: IGameOptions = {}) {
    this.engine = engine
    this.scene = new BABYLON.Scene(this.engine)
    this.assetsReady = new BehaviorSubject<boolean>(false)
    this.assetsManager = new BABYLON.AssetsManager(this.scene)
    this.camera = new BABYLON.ArcRotateCamera('main', -Math.PI / 2, 1, 200, new BABYLON.Vector3(0, 1, 0), this.scene)
    this.camera.fov = 0.7
    if (options.canvas) {
      this.canvas = options.canvas
      this.camera.attachControl(this.canvas)
    }
    else this.server = true
    this.options = options
    this.skybox = new Skybox(this)

    this.input = new Input(this)
    this.assetsManager.onFinish = () => {
      this.assetsReady.next(true)
    }

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    this.preload()
  }

  preload() {
    const meshes = ['pingu.glb']
    for (let mesh of meshes) {
      const meshTask = this.assetsManager.addMeshTask(`${mesh} - task`, '', 'assets/', mesh)
      meshTask.onSuccess = (task) => {
        task.loadedMeshes[0].setEnabled(false)
        this.assets.meshes[mesh] = task
      }
    }

    this.assetsManager.load()
  }

  async init() {
    const ammo = await Ammo()
    this.scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.AmmoJSPlugin(true, ammo))

    this.setMode('soccer')
  }

  setMode(mode: string) {
    if (mode === 'soccer') this.mode = new Soccer(this)

    if (this.mode) this.mode.init()
  }
}

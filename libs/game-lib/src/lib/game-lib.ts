import * as BABYLON from 'babylonjs';
import Ammo from 'ammo.js';
import { IGameOptions } from '..';
import { Input } from './src/input';
import { IInputMap } from '@winter-sports/game-lib';
import { Playground } from './src/modes/playground/playground';
import { Skybox } from './src/misc/skybox';
import { Soccer } from './src/modes/soccer/soccer';

export class Game {
  canvas?: HTMLCanvasElement
  server: boolean = false;
  scene!: BABYLON.Scene
  camera!: BABYLON.Camera
  skybox!: Skybox;

  input?: Input;
  currentInputs: IInputMap = {};

  mode?: Playground | any;
  
  constructor(public engine: BABYLON.Engine, public options: IGameOptions = {}) {
    this.engine = engine
    this.scene = new BABYLON.Scene(this.engine)
    this.camera = new BABYLON.ArcRotateCamera('main', -Math.PI / 2, 1, 200, new BABYLON.Vector3(0, 1, 0), this.scene)
    this.camera.fov = 0.7
    if (options.canvas) {
      this.canvas = options.canvas
      this.camera.attachControl(this.canvas)
    }
    else this.server = true
    this.options = options
    this.skybox = new Skybox(this)

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  async init() {
    const ammo = await Ammo()
    this.scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.AmmoJSPlugin(true, ammo))

    this.setMode('soccer')
  }

  setMode(mode: string) {
    if(mode === 'soccer') this.mode = new Soccer(this)

    if(this.mode) this.mode.init()
  }
}

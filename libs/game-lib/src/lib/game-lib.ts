import * as BABYLON from 'babylonjs';
import Ammo from 'ammo.js';
import { IGameOptions } from '..';
import { Input } from './src/input';
import { IInputMap } from '@winter-sports/game-lib';
import { Playground } from './src/modes/playground/playground';
import { Skybox } from './src/misc/skybox';
import { Soccer } from './src/modes/soccer/soccer';
import { BehaviorSubject, Subject } from 'rxjs';
import { SoccerPlayer } from './src/modes/soccer/player';
BABYLON.Animation.AllowMatricesInterpolation = true;
export class Game {
  canvas?: HTMLCanvasElement
  server: boolean = false;
  scene!: BABYLON.Scene
  camera!: BABYLON.Camera
  skybox!: Skybox;
  shadowGenerator?: BABYLON.ShadowGenerator;
  input?: Input;
  currentInputs: IInputMap = {};
  mode?: Soccer;
  emitter = new Subject<{ event: string; args: any}>()
  currentState = new BehaviorSubject<string>('title-screen')
  selfId?: string;

  constructor(public engine: BABYLON.Engine, public options: IGameOptions = {}) {
    this.engine = engine
    this.scene = new BABYLON.Scene(this.engine)
    this.camera = new BABYLON.ArcRotateCamera('main', -Math.PI / 2, 1, 200, new BABYLON.Vector3(0, 1, 0), this.scene)
    this.camera.fov = 0.7
    if (options.canvas) {
      this.canvas = options.canvas
      this.camera.attachControl(this.canvas)
      this.skybox = new Skybox(this)
    }
    else this.server = true
    this.options = options
    this.input = new Input(this)

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }


  async init() {
    const ammo = await Ammo()
    this.scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.AmmoJSPlugin(true, ammo))

    // this.setMode('Soccer')
    // if(this.mode) {
    //   this.mode.players = [ new SoccerPlayer(this, this.mode!, 0)]
    //   this.mode.players[0].setId('SELF')
    // }
    
  }

  setMode(mode: string) {
    console.log('INIT ' + mode)
    if (mode === 'Soccer') this.mode = new Soccer(this)
    if (this.mode) this.mode.init()
  }
}

import * as BABYLON from 'babylonjs';
import Ammo from 'ammo.js'
import { Soccer } from './src/soccer';
import { IGameOptions, IGameState, Player } from '..';
import { IGameMode } from './interfaces';
import { TitleScreen } from './src/titleScreen';
import { SoundtrackManager } from './src/soundtrackManager';

export class Game {
  canvas?: HTMLCanvasElement
  scene: BABYLON.Scene
  engine: BABYLON.Engine
  camera: BABYLON.Camera
  hemisphericLight: BABYLON.HemisphericLight;
  light: BABYLON.DirectionalLight
  shadowGenerator: BABYLON.ShadowGenerator;
  skybox?: BABYLON.Mesh

  gameMode: IGameMode | null = null
  sport: Soccer | null = null;
  players: Player[] = []
  options: IGameOptions

  playerId: string | null = null
  self?: Player;

  titleScreen?: TitleScreen;
  soundtrackManager: SoundtrackManager;

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

    this.soundtrackManager = new SoundtrackManager(this)

    if (!this.options.isServer) this.generateSkybox()

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  async init() {
    const ammo = await Ammo()
    this.scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.AmmoJSPlugin(true, ammo))

    if(!this.options.isServer) {
      this.startTitleScreen()
    }
  }

  async startTitleScreen() {
    this.titleScreen = new TitleScreen(this)
  }

  async startGameMode(gamemode: IGameMode) {    
    switch (gamemode.name) {
      case 'Soccer':
        this.sport = new Soccer(this);
        break;
      case 'Practice':
        this.sport = new Soccer(this);
        break;
    }
  }

  generateSkybox() {
    this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 750 }, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/sunny", this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    this.skybox.material = skyboxMaterial;
  }

  followPlayer(player: Player) {
    if (player.camera) this.scene.switchActiveCamera(player.camera, true)
  }

  setSelf(player: Player) {
    this.self = player
  }

  updateGame(state: IGameState) {
    if(this.sport) {
      this.sport.ball.position.x = state.ball.position.x
      this.sport.ball.position.y = state.ball.position.y
      this.sport.ball.position.z = state.ball.position.z
      this.sport.ball.rotation.x = state.ball.rotation.x
      this.sport.ball.rotation.y = state.ball.rotation.y
      this.sport.ball.rotation.z = state.ball.rotation.z
      this.sport.ball.physicsImpostor?.setAngularVelocity(new BABYLON.Vector3(
        state.ball.angularVelocity.x, state.ball.angularVelocity.y, state.ball.angularVelocity.z,
      ))
      this.sport.ball.physicsImpostor?.setLinearVelocity(new BABYLON.Vector3(
        state.ball.linearVelocity.x, state.ball.linearVelocity.y, state.ball.linearVelocity.z,
      ))
    }
    for(let player of state.players) {
      const currentPlayer = this.players.find(p => p.state.id === player.id)
      if(currentPlayer) { 
        currentPlayer.collider!.position.x = player.position!.x
        currentPlayer.collider!.position.y = player.position!.y
        currentPlayer.collider!.position.z = player.position!.z
        currentPlayer.velocity.x = player.velocity!.x
        currentPlayer.velocity.y = player.velocity!.y
        currentPlayer.velocity.z = player.velocity!.z
      }
      else { this.players.push(new Player(this, player))}
    }
  }
}

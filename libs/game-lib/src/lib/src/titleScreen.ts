import { Game } from './../game-lib';
import * as BABYLON from 'babylonjs'

export class TitleScreen {
    game: Game;

    characterSupport?: BABYLON.Mesh;
    character?: BABYLON.AbstractMesh;
    music: BABYLON.Sound;

    constructor(game: Game) {
        this.game = game;
        (this.game.camera as BABYLON.ArcRotateCamera).beta = Math.PI / 1.9;
        (this.game.camera as BABYLON.ArcRotateCamera).radius = 5;
        (this.game.camera as BABYLON.ArcRotateCamera).target = new BABYLON.Vector3(0, 1, 0)
        this.characterSupport = BABYLON.MeshBuilder.CreateCylinder('characterSupport', {
            diameter: 10, height: 10, tessellation: 64
        }, this.game.scene)
        this.characterSupport.position.y = -5

        const sand = new BABYLON.StandardMaterial("sand", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/sand.jpg", this.game.scene);
        texture.uScale = 3
        texture.vScale = 3
        sand.ambientTexture = texture
        this.characterSupport.material = sand
        this.characterSupport.receiveShadows = true

        this.characterSupport.registerBeforeRender(() => {
            (this.game.camera as BABYLON.ArcRotateCamera).alpha += 0.0002;
        })
        this.music = new BABYLON.Sound("Music", "assets/music/titlescreen.mp3", this.game.scene, null, {
            loop: true,
            autoplay: true,
            volume: 0.4
        });
        this.init()
    }

    async init() {
        const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "boxes.glb", this.game.scene)
        this.character = meshes.meshes[0]
        this.character.scaling = new BABYLON.Vector3(.3, .3, .3)
        this.game.shadowGenerator.addShadowCaster(this.character)
    }


}
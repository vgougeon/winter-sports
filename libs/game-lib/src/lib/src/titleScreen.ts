import { Game } from './../game-lib';
import * as BABYLON from 'babylonjs'

export class TitleScreen {
    game: Game;

    characterSupport?: BABYLON.Mesh;
    support?: BABYLON.Mesh;
    character?: BABYLON.AbstractMesh;

    decorations: BABYLON.AbstractMesh[] = []

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

        this.support = BABYLON.MeshBuilder.CreateCylinder('support', {
            diameter: 30, height: 9, tessellation: 64
        }, this.game.scene)
        this.support.position.y = -5

        const grass = new BABYLON.StandardMaterial("grass", this.game.scene);
        const gtexture = new BABYLON.Texture("assets/textures/pitch2.png", this.game.scene);
        gtexture.uScale = 3
        gtexture.vScale = 3
        grass.ambientTexture = gtexture
        this.support.material = grass
        this.support.receiveShadows = true
        this.support.rotation.x = -0.07


        this.game.soundtrackManager.playTitleScreen()

        this.init()
    }

    async init() {
        // const waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 2048, 2048, 16, this.game.scene, false);
        // const water = new BABYLON.WaterMaterial('water', this.game.scene as any)
        // water.backFaceCulling = true;
        // water.bumpTexture = new BABYLON.Texture("assets/texturemap/waterbump.png", this.game.scene) as any;
        // water.windForce = -10;
        // water.waveHeight = 1.7;
        // water.bumpHeight = 0.1;
        // water.windDirection = new BABYLON.Vector2(1, 1) as any;
        // water.waterColor = new BABYLON.Color3(0, 0, 221 / 255);
        // water.colorBlendFactor = 0.0;
        // water.addToRenderList(this.game.skybox);
        // waterMesh.material = water as any;

        const meshes = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "boxes.glb", this.game.scene)
        this.character = meshes.meshes[0]
        this.character.scaling = new BABYLON.Vector3(.3, .3, .3)
        this.game.shadowGenerator.addShadowCaster(this.character)

        const tree = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/objects/", "tree.glb", this.game.scene)
        this.addMesh(tree, new BABYLON.Vector3(-2, -0.1, 2), 0.3)

        const chair = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/objects/", "chair.glb", this.game.scene)
        this.addMesh(chair, new BABYLON.Vector3(-2.7, 0, 0.4), 0.25, Math.PI)

        


    }

    async addMesh(loaded: BABYLON.ISceneLoaderAsyncResult, position: BABYLON.Vector3, scale = 0.3, yRotate = 0) {
        this.decorations.push(loaded.meshes[0])
        loaded.meshes[0].scaling = new BABYLON.Vector3(scale, scale, scale)
        loaded.meshes[0].position = position;
        loaded.meshes[0].rotateAround(loaded.meshes[0].position, new BABYLON.Vector3(0, 1, 0), yRotate)
        this.game.shadowGenerator.addShadowCaster(loaded.meshes[0])
    }

}
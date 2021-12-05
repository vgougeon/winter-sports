import * as BABYLON from 'babylonjs'
import { Mesh } from "babylonjs/Meshes/mesh";
import { Game } from "../../game-lib";
import gsap from 'gsap';

export class Skybox {
    skyboxDay!: Mesh;
    skyboxNight!: Mesh;
    hemisphericLight!: BABYLON.HemisphericLight;
    light!: BABYLON.DirectionalLight
    time: number = 0;

    constructor(private game: Game) { 
        this.generateLight()
        this.generateSkybox()
        this.game.scene.registerBeforeRender(() => {
            this.time += 0.0004
        })
    }

    generateLight() {
        this.hemisphericLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 2, 0), this.game.scene);
        this.hemisphericLight.intensity = 0.7
    
        this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), this.game.scene);
        this.light.intensity = 1
        this.light.position = new BABYLON.Vector3(20, 40, 20);
    }

    generateSkybox() {
        const dayMaterial = new BABYLON.StandardMaterial("skyBox", this.game.scene);
        dayMaterial.backFaceCulling = false;
        dayMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/sunny", this.game.scene);
        dayMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        dayMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        dayMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

        const nightMaterial = new BABYLON.StandardMaterial("skyBox", this.game.scene);
        nightMaterial.backFaceCulling = false;
        nightMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/night", this.game.scene);
        nightMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        nightMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        nightMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

        this.skyboxDay = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1080 }, this.game.scene);
        this.skyboxNight = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1050 }, this.game.scene);

        this.skyboxDay.material = dayMaterial;
        this.skyboxNight.material = nightMaterial;

        this.skyboxDay.visibility = 0.5
        this.skyboxNight.visibility = 0

        this.game.scene.registerBeforeRender(this.timeCycle.bind(this))
    }

    timeCycle() {
        if (this.time >= 24) this.time = 0

        const dayVisibility = gsap.utils.pipe(
            gsap.utils.mapRange(0, 24, 0, 1),
            gsap.utils.interpolate([0, 1, 0])
        )

        const nightVisibility = gsap.utils.pipe(
            gsap.utils.mapRange(0, 24, 0, 1),
            gsap.utils.interpolate([1, 0, 1])
        )

        const lightIntensity = gsap.utils.pipe(
            gsap.utils.mapRange(0, 24, 0, 1),
            gsap.utils.interpolate([0.1, 0.8, 0.1])
        )

        const hemisphericLightIntensity = gsap.utils.pipe(
            gsap.utils.mapRange(0, 24, 0, 1),
            gsap.utils.interpolate([0.1, 0.5, 0.1])
        )

        const color = gsap.utils.pipe(
            gsap.utils.mapRange(0, 24, 0, 1),
            gsap.utils.interpolate(['#2222ff',  '#ffffff', '#2222ff'])
        )

        const rotation = gsap.utils.pipe(
            gsap.utils.mapRange(0, 24, 0, Math.PI * 2)
        )

        this.skyboxDay!.visibility = dayVisibility(this.time)
        this.skyboxNight!.visibility = nightVisibility(this.time)
        this.light.intensity = lightIntensity(this.time)
        this.hemisphericLight.intensity = hemisphericLightIntensity(this.time)
        this.skyboxDay!.rotation.y = rotation(this.time)
        this.skyboxNight!.rotation.y = -rotation(this.time)
        const c = gsap.utils.splitColor(color(this.time))
        this.hemisphericLight.diffuse = new BABYLON.Color3(
            gsap.utils.mapRange(0, 255, 0, 1, c[0]),
            gsap.utils.mapRange(0, 255, 0, 1, c[1]),
            gsap.utils.mapRange(0, 255, 0, 1, c[2])
        )
    }
}
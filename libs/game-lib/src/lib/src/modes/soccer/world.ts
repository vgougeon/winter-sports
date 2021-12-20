import { Game } from '@winter-sports/game-lib';
import { Soccer } from './soccer';
import * as BABYLON from 'babylonjs'
import gsap from 'gsap'
import { setUVScale } from '../../misc/uv';

export class SoccerWorld {
    field: BABYLON.Mesh;
    under: BABYLON.Mesh;
    lines: BABYLON.Mesh[] = []
    borders: BABYLON.Mesh[] = []
    lights: BABYLON.Light[] = []
    redGoal: BABYLON.Mesh[] = []
    blueGoal: BABYLON.Mesh[] = []
    redGoalZone!: BABYLON.Mesh;
    blueGoalZone!: BABYLON.Mesh;

    settings = {
        width: 250, depth: 140, thickness: 1, borderHeight: 5,
        borderTickness: 0.5, goalWidth: 40, goalHeight: 15, underOffset: 15,
        goalDepth: 20
    }

    destroy() {
        this.field.dispose()
        this.under.dispose()
        this.redGoalZone.dispose()
        this.blueGoalZone.dispose()
        for(let item of this.lines) item.dispose()
        for(let item of this.borders) item.dispose()
        for(let item of this.lights) item.dispose()
        for(let item of this.redGoal) item.dispose()
        for(let item of this.blueGoal) item.dispose()
    }

    constructor(private game: Game, private soccer: Soccer) {
        this.field = this.createField()
        this.under = this.createUnder()
        this.borders = this.createBorders()
        this.createGoals()

        if (this.game.canvas) {
            this.lines = this.createLines()
            // this.lights = this.createLights()
            this.applyTextures()
            this.enableShadows()
        }

    }

    enableShadows() {
        for (let mesh of this.redGoal) this.game.skybox.shadowGenerator.addShadowCaster(mesh)
        for (let mesh of this.blueGoal) this.game.skybox.shadowGenerator.addShadowCaster(mesh)
    }

    createField() {
        const field = BABYLON.MeshBuilder.CreateBox('field', { width: this.settings.width, height: 1, depth: this.settings.depth })
        field.position.y = -0.51
        field.physicsImpostor = new BABYLON.PhysicsImpostor(field,
            BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1, friction: 10 }, this.game.scene);
        field.checkCollisions = true
        return field
    }

    createUnder() {
        // const under = BABYLON.MeshBuilder.CreateDisc('under', { radius: this.settings.width })
        const under = BABYLON.MeshBuilder.CreateBox('under', { width: this.settings.width + this.settings.goalDepth * 2, height: 0.5, depth: this.settings.goalWidth})
        under.position.y = -0.51
        under.physicsImpostor = new BABYLON.PhysicsImpostor(under,
            BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1, friction: 10 }, this.game.scene);
        under.checkCollisions = true
        return under
    }

    createLines() {
        const lines: BABYLON.Mesh[] = []
        const { width, depth, thickness } = this.settings;
        lines[0] = BABYLON.MeshBuilder.CreatePlane('line0', { width: thickness, height: depth })
        lines[0].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        lines[0].setParent(this.field)

        lines[1] = BABYLON.MeshBuilder.CreateLathe('circle', {
            shape: [new BABYLON.Vector3(0.33, 0, 0), new BABYLON.Vector3(0.35, 0, 0)],
            radius: depth / 2,
            tessellation: 64
        })
        //TODO: Replace 0.33 with line thickness calculation
        lines[1].rotation = new BABYLON.Vector3(-Math.PI / 2 * 2, -Math.PI / 2, 0)

        lines[2] = BABYLON.MeshBuilder.CreatePlane('line1', { width: width, height: thickness })
        lines[2].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        lines[2].position.z = depth / 2 - thickness / 2
        lines[2].setParent(this.field)

        lines[3] = BABYLON.MeshBuilder.CreatePlane('line2', { width: width, height: thickness })
        lines[3].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        lines[3].position.z = -depth / 2 + thickness / 2
        lines[3].setParent(this.field)

        lines[4] = BABYLON.MeshBuilder.CreatePlane('line0', { width: thickness, height: depth })
        lines[4].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        lines[4].position.x = -width / 2 + thickness / 2
        lines[4].setParent(this.field)

        lines[5] = BABYLON.MeshBuilder.CreatePlane('line0', { width: thickness, height: depth })
        lines[5].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2)
        lines[5].position.x = width / 2 - thickness / 2
        lines[5].setParent(this.field)

        lines[6] = BABYLON.MeshBuilder.CreateDisc('central_point', { radius: thickness })
        lines[6].rotation = new BABYLON.Vector3(Math.PI / 2, 0, Math.PI / 2)
        lines[6].setParent(this.field)
        return lines
    }

    createBorders() {
        const borders: BABYLON.Mesh[] = []
        const physics = { mass: 0, restitution: 1.5 }
        const { width, depth, borderHeight, borderTickness, goalWidth, goalHeight } = this.settings;
        //SIDES
        borders[0] = BABYLON.MeshBuilder.CreateBox('border1', { width: width, height: borderHeight, depth: borderTickness })
        borders[0].position = new BABYLON.Vector3(0, borderHeight / 2, depth / 2 + borderTickness / 2)
        borders[0].physicsImpostor = new BABYLON.PhysicsImpostor(
            borders[0], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )
        borders[0].checkCollisions = true

        borders[1] = BABYLON.MeshBuilder.CreateBox('border1', { width: width, height: borderHeight, depth: borderTickness })
        borders[1].position = new BABYLON.Vector3(0, borderHeight / 2, - depth / 2 - borderTickness / 2)
        borders[1].rotation.z = Math.PI
        borders[1].physicsImpostor = new BABYLON.PhysicsImpostor(
            borders[1], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )
        borders[1].checkCollisions = true

        //GOAL EDGES
        borders[2] = BABYLON.MeshBuilder.CreateBox('border2',
            { width: (depth - goalWidth) / 2, height: borderHeight, depth: borderTickness }
        )
        borders[2].position = new BABYLON.Vector3(
            - width / 2 - borderTickness / 2,
            borderHeight / 2,
            (- goalWidth / 2) - (depth - goalWidth) / 4
        )
        borders[2].rotation.y = Math.PI / 2
        borders[2].rotation.z = Math.PI
        borders[2].physicsImpostor = new BABYLON.PhysicsImpostor(
            borders[2], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )
        borders[2].checkCollisions = true

        borders[3] = BABYLON.MeshBuilder.CreateBox('border2',
            { width: (depth - goalWidth) / 2, height: borderHeight, depth: borderTickness }
        )
        borders[3].position = new BABYLON.Vector3(
            - width / 2 - borderTickness / 2,
            borderHeight / 2,
            (goalWidth / 2) + (depth - goalWidth) / 4
        )
        borders[3].rotation.y = Math.PI / 2
        borders[3].rotation.z = Math.PI
        borders[3].physicsImpostor = new BABYLON.PhysicsImpostor(
            borders[3], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )
        borders[3].checkCollisions = true

        borders[4] = BABYLON.MeshBuilder.CreateBox('border2',
            { width: (depth - goalWidth) / 2, height: borderHeight, depth: borderTickness }
        )
        borders[4].position = new BABYLON.Vector3(
            width / 2 + borderTickness / 2,
            borderHeight / 2,
            (goalWidth / 2) + (depth - goalWidth) / 4
        )
        borders[4].rotation.y = Math.PI / 2
        borders[4].physicsImpostor = new BABYLON.PhysicsImpostor(
            borders[4], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )
        borders[4].checkCollisions = true

        borders[5] = BABYLON.MeshBuilder.CreateBox('border2',
            { width: (depth - goalWidth) / 2, height: borderHeight, depth: borderTickness }
        )
        borders[5].position = new BABYLON.Vector3(
            width / 2 + borderTickness / 2,
            borderHeight / 2,
            (- goalWidth / 2) - (depth - goalWidth) / 4
        )
        borders[5].rotation.y = Math.PI / 2
        borders[5].physicsImpostor = new BABYLON.PhysicsImpostor(
            borders[5], BABYLON.PhysicsImpostor.BoxImpostor, physics
        )
        borders[5].checkCollisions = true

        return borders
    }

    createGoals() {
        const { goalHeight, goalWidth, width, goalDepth } = this.settings
        const diameter = 1.5
        const goalMaterial = new BABYLON.StandardMaterial('goal', this.game.scene)
        goalMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
        goalMaterial.ambientColor = new BABYLON.Color3(0, 0, 0)

        // goalMaterial.disableLighting = true
        const genGoal = (direction: number) => {
            const g: BABYLON.Mesh[] = []
            g[0] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalHeight + diameter, diameter: diameter, tessellation: 8 })
            g[0].position = new BABYLON.Vector3(direction * width / 2, goalHeight / 2 - 1, goalWidth / 2)
            g[0].physicsImpostor = new BABYLON.PhysicsImpostor(g[0], BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 })
            g[0].checkCollisions = true //POST

            g[1] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalHeight + diameter, diameter: diameter, tessellation: 8 })
            g[1].position = new BABYLON.Vector3(direction * width / 2, goalHeight / 2 - 1, -goalWidth / 2)
            g[1].physicsImpostor = new BABYLON.PhysicsImpostor(g[1], BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 })
            g[1].checkCollisions = true //POST

            g[2] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalWidth, diameter: diameter, tessellation: 8 })
            g[2].position = new BABYLON.Vector3(direction * width / 2, goalHeight - 1, 0)
            g[2].rotation.x = Math.PI / 2
            g[2].checkCollisions = true //CROSSBAR

            g[3] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalHeight + diameter, diameter: diameter / 2, tessellation: 8 })
            g[3].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth, goalHeight / 2 - 1, -goalWidth / 2)

            g[4] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalHeight + diameter, diameter: diameter / 2, tessellation: 8 })
            g[4].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth, goalHeight / 2 - 1, goalWidth / 2)

            g[5] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalDepth, diameter: diameter / 2, tessellation: 8 })
            g[5].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight - 0.7, goalWidth / 2)
            g[5].rotation.z = Math.PI / 2

            g[6] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalDepth, diameter: diameter / 2, tessellation: 8 })
            g[6].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight - 0.7, - goalWidth / 2)
            g[6].rotation.z = Math.PI / 2

            g[7] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalWidth, diameter: diameter / 2, tessellation: 8 })
            g[7].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth, goalHeight - 0.7, 0)
            g[7].rotation.x = Math.PI / 2
            for(let mesh of g) mesh.material = goalMaterial

            g[8] = BABYLON.MeshBuilder.CreateBox(`goal${direction}`, { height: goalHeight, width: goalWidth, depth: 0.5 })
            g[8].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth, goalHeight / 2, 0)
            g[8].rotation.y = Math.PI / 2
            g[8].checkCollisions = true
            g[8].physicsImpostor = new BABYLON.PhysicsImpostor(g[8], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 })

            g[9] = BABYLON.MeshBuilder.CreateBox(`goal${direction}`, { height: goalHeight, width: goalDepth, depth: 0.5 })
            g[9].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight / 2, goalWidth / 2)
            g[9].checkCollisions = true
            g[9].physicsImpostor = new BABYLON.PhysicsImpostor(g[9], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 })

            g[10] = BABYLON.MeshBuilder.CreateBox(`goal${direction}`, { height: goalHeight, width: goalDepth, depth: 0.5 })
            g[10].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight / 2, - goalWidth / 2)
            g[10].checkCollisions = true
            g[10].physicsImpostor = new BABYLON.PhysicsImpostor(g[10], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 })

            g[11] = BABYLON.MeshBuilder.CreateBox(`goal${direction}`, { height: goalDepth, width: goalWidth, depth: 0.5 })
            g[11].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight - 0.7, 0)
            g[11].rotation.y = Math.PI / 2
            g[11].rotation.x = Math.PI / 2
            g[11].checkCollisions = true
            g[11].physicsImpostor = new BABYLON.PhysicsImpostor(g[11], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 })


            return g
        }

        this.redGoal = genGoal(1)
        this.blueGoal = genGoal(-1)


        this.redGoalZone = BABYLON.MeshBuilder.CreateBox('redGoalZone', {
            width: goalDepth, height: goalHeight - 3, depth: goalWidth - 3, sideOrientation: BABYLON.Mesh.BACKSIDE
        })
        this.redGoalZone.isVisible = false
        this.redGoalZone.position = new BABYLON.Vector3(width / 2 + (goalDepth / 2 + 3), goalHeight / 2 - 1, 0)


        this.blueGoalZone = BABYLON.MeshBuilder.CreateBox('blueGoalZone', {
            width: goalDepth, height: goalHeight - 3, depth: goalWidth - 3, sideOrientation: BABYLON.Mesh.BACKSIDE
        })
        this.blueGoalZone.isVisible = false
        this.blueGoalZone.position = new BABYLON.Vector3(-width / 2 - (goalDepth / 2 + 3), goalHeight / 2 - 1, 0)
    }

    createLights() {
        const { width, depth } = this.settings
        const lights: BABYLON.Light[] = []

        const genLight = (p: BABYLON.Vector3) => {
            const l = new BABYLON.PointLight('fLight', p, this.game.scene);
            l.intensity = 0;
            gsap.to(l, { intensity: 3, duration: 15, delay: lights.length * 0.5, })
            return l;
        }

        lights[0] = genLight(new BABYLON.Vector3(width / 2, 5, depth / 2))
        lights[1] = genLight(new BABYLON.Vector3(-width / 2, 5, depth / 2))
        lights[2] = genLight(new BABYLON.Vector3(width / 2, 5, -depth / 2))
        lights[3] = genLight(new BABYLON.Vector3(-width / 2, 5, -depth / 2))

        return lights
    }

    applyTextures() {
        //#region The pitch
        const grass = new BABYLON.StandardMaterial("grass", this.game.scene);
        grass.specularColor = new BABYLON.Color3(0, 0, 0)
        const t1 = new BABYLON.Texture("assets/textures/pitch2.png", this.game.scene);
        t1.uScale = 6
        t1.vScale = 8
        grass.ambientTexture = t1
        grass.maxSimultaneousLights = 8
        this.field.material = grass
        this.field.receiveShadows = true
        //#endregion

        //#region Under the pitch
        const under = new BABYLON.StandardMaterial("under", this.game.scene);
        under.specularColor = new BABYLON.Color3(0, 0, 0)
        const t2 = new BABYLON.Texture("assets/textures/sand.jpg", this.game.scene);
        t2.uScale = 6
        t2.vScale = 8
        under.ambientTexture = t2
        under.maxSimultaneousLights = 8
        this.under.material = under
        this.under.receiveShadows = true
        //#endregion

        //#region Borders
        const material = new BABYLON.StandardMaterial("borders", this.game.scene)
        material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1)
        material.alpha = 0.1

        this.borders[5].material = material
        this.borders[4].material = material
        this.borders[3].material = material
        this.borders[2].material = material
        this.borders[1].material = material
        this.borders[0].material = material
        //#endregion

        //#region Net material
        const netMaterial = new BABYLON.StandardMaterial("net", this.game.scene);
        netMaterial.useAlphaFromDiffuseTexture = true
        const texture = new BABYLON.Texture("assets/textures/borders.png", this.game.scene);
        texture.uScale = 1
        texture.vScale = 3
        texture.hasAlpha = true
        netMaterial.diffuseTexture = texture
        netMaterial.emissiveTexture = texture
        netMaterial.alpha = 0.5
        const setNetMaterial = (mesh: BABYLON.Mesh) => {
            if(!mesh.material) { 
                const size = mesh.getBoundingInfo().boundingBox.extendSize
                mesh.material = netMaterial
                setUVScale(mesh, size.x / 4, size.y / 8)
            }
        }

        for(let mesh of this.redGoal) setNetMaterial(mesh)
        for(let mesh of this.blueGoal) setNetMaterial(mesh)
        netMaterial.disableLighting = true
        //#endregion
    }

}
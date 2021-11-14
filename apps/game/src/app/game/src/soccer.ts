import { Game } from "../game";
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class Soccer {
    game: Game;
    field: BABYLON.Mesh

    constructor(game: Game) {
        this.game = game
        this.field = BABYLON.MeshBuilder.CreateGround("ground", { width: 150, height: 70 });
        this.field.physicsImpostor = new BABYLON.PhysicsImpostor(this.field, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9,
            friction: 0
        }, this.game.scene);

        const redSphere = BABYLON.Mesh.CreateSphere("sphere", 32, 2, this.game.scene);
        redSphere.position = new BABYLON.Vector3(5, 5, 5);
        redSphere.physicsImpostor = new BABYLON.PhysicsImpostor(redSphere, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1, restitution: 0.9, friction: 1
        }, this.game.scene);

        const redMat = new BABYLON.StandardMaterial("ground", this.game.scene);
        redMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        redMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        redMat.emissiveColor = BABYLON.Color3.Red();
        redSphere.material = redMat;

        redSphere.physicsImpostor.applyImpulse(new BABYLON.Vector3(1, 2, -1), new BABYLON.Vector3(1, 2, 0));

        const grass = new BABYLON.StandardMaterial("grass", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/grass.png", this.game.scene);
        texture.uScale = 10
        texture.vScale = 10
        grass.ambientTexture = texture
        this.field.material = grass

    }
}
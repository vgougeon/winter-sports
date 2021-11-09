import { Game } from "../game";

export class Soccer {
    game: Game;
    field: BABYLON.Mesh

    constructor(game: Game) {
        this.game = game
        this.field = BABYLON.MeshBuilder.CreateGround("ground", { width: 150, height: 70});
        this.field.receiveShadows = true
    }
}
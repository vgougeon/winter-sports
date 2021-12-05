import { Game } from "../../game-lib";
import * as BABYLON from 'babylonjs';
import { PlayerRenderer } from "./render";

export class Player {
    collider!: BABYLON.Mesh;
    renderer!: PlayerRenderer

    constructor(private game: Game) { this.init() }
    destroy() { this.collider?.dispose() }

    init() {
        this.collider = BABYLON.MeshBuilder.CreateBox('player_collider', { width: 2, height: 4, depth: 1.3 }, this.game.scene)
        this.renderer = new PlayerRenderer(this.game, this)
    }

    

}
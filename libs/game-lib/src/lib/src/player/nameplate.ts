import { Game } from '@winter-sports/game-lib';
import { BasePlayer } from './player';
import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'

export class PlayerNameplate {
    advancedTexture?: GUI.AdvancedDynamicTexture;
    nameplatePlane?: BABYLON.Mesh;
    nameplate?: GUI.TextBlock;
    constructor(private game: Game, private player: BasePlayer) {
        this.nameplatePlane = BABYLON.MeshBuilder.CreatePlane('nameplate', { width: 10, height: 10 }, this.game.scene)
        this.nameplatePlane.parent = this.player.collider
        this.nameplatePlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        this.nameplatePlane.locallyTranslate(new BABYLON.Vector3(0, 4, 0))
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(this.nameplatePlane)
        this.nameplate = new GUI.TextBlock();
        this.nameplate.text = 'Jabu';
        this.nameplate.shadowBlur = 10
        this.nameplate.fontSizeInPixels = 60;
        this.nameplate.fontWeight = 'bold';
        this.nameplate.color = '#ffffffff'
        this.advancedTexture.addControl(this.nameplate);
    }
}
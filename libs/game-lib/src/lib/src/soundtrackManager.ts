import * as BABYLON from 'babylonjs';
import { Game } from './../game-lib';

export class SoundtrackManager {
    game: Game;

    titleScreenOst: BABYLON.Sound[] = []
    currentlyPlaying?: BABYLON.Sound;

    constructor(game: Game) {
        this.game = game
    }

    playTitleScreen() {
        if(this.titleScreenOst.length === 0) {
            this.titleScreenOst = [
                new BABYLON.Sound('OST1', 'assets/music/titlescreen.mp3', this.game.scene),
                new BABYLON.Sound('OST2', 'assets/music/salsa.mp3', this.game.scene)
            ]
        }

        this.titleScreenOst[0].play()
    }
}
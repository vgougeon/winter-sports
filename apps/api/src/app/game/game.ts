import { PlayerSocket } from '../../types/player-socket.interface';
import * as BABYLON from 'babylonjs';
import { Game as GameInstance, IInputMap } from '@winter-sports/game-lib';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
import { BehaviorSubject, Subject } from 'rxjs';
import gamesManager from '../gamesManager/gamesManager';
dayjs.extend(duration)
export class Game {
    engine: BABYLON.Engine
    game: GameInstance
 
    players: PlayerSocket[] = []
    gameHealth = this.checkHealth.bind(this)

    intervalId: NodeJS.Timeout;

    emitter = new Subject<{ event: string; args: any}>()
    constructor(players: PlayerSocket[], private gameMode: string) {
        for(let player of players) {
            this.addPlayer(player)
        }
        this.engine = new BABYLON.NullEngine()
        this.game = new GameInstance(this.engine)

        this.intervalId = setInterval(this.gameHealth, 1000)
    }


    addPlayer(player: PlayerSocket) {
        player.on('disconnect', () => {
            this.players = this.players.filter(p => p.id !== player.id)
        })
        player.on('i', (i: IInputMap) => {
            const currentPlayer = this.game.mode.players.find(p => p.id === player.id)
            currentPlayer.inputs = i
        })
        this.players.push(player)
    }

    async init() {
        await this.game.init()
        this.emitter = this.game.emitter
        this.emitter.subscribe((req) => {
            for(let player of this.players) player.emit(req.event, req.args)
        })
        this.game.setMode(this.gameMode)
        this.game.mode.addPlayers(this.players)
    }

    checkHealth() {
        if(this.players.length === 0) {
            console.log("GAME DESTROYED")
            this.stop()
        }
        else { console.log("GAME HEALTHY")}
    }

    stop() {
        clearInterval(this.intervalId)
        this.game.scene.dispose()
        this.engine.dispose()
        gamesManager.remove(this)
    }


}
import { PlayerSocket } from '../../types/player-socket.interface';
import { Game } from '../game/game';

class GamesManager {
    games: Game[] = []
    constructor() {
        console.log("Game manager ON")
    }

    createGame(players: PlayerSocket[]) {
        this.games.push(new Game(players))
    }
}

export default new GamesManager()
import { PlayerSocket } from '../../types/player-socket.interface';
import { Game } from '../game/game';

class GamesManager {
    games: Game[] = []
    constructor() {
        console.log("Game manager ON")
    }

    createGame(players: PlayerSocket[]) {
        const game = new Game(players)
        this.games.push(game)
        return game
    }
}

export default new GamesManager()
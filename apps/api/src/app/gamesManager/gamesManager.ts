import { PlayerSocket } from '../../types/player-socket.interface';
import { Game } from '../game/game';

class GamesManager {
    games: Game[] = []
    constructor() {
        console.log("Game manager ON")
    }

    async createGame(players: PlayerSocket[], gameMode: string) {
        const game = new Game(players, gameMode)
        await game.init()
        this.games.push(game)
        return game
    }

    remove(game: Game) {
        this.games = this.games.filter(g => g !== game)
    }
}

export default new GamesManager()
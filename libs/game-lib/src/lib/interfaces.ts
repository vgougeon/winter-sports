export interface IGameState {
    ball: {
        position: BABYLON.Vector3;
        rotation: BABYLON.Vector3;
    }
    players: IPlayerState[],
    teams: {
        id: number;
        score: number;
    }[]
}

export interface IPlayerState {
    id: string;
    teamId: number;
    name: string;
    position?: BABYLON.Vector3;
    velocity?: BABYLON.Vector3;
}

export interface IGameOptions {
    canvas?: HTMLCanvasElement,
    isServer?: boolean
}

export interface IGameMode {
    name: 'Soccer' | 'Beach Volley';
    fieldWidth?: number;
    fieldHeight?: number;
}
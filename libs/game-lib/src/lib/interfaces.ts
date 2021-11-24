export interface IGameState {
    ball: {
        position: BABYLON.Vector3;
        rotation: BABYLON.Vector3;
        angularVelocity: BABYLON.Vector3;
        linearVelocity: BABYLON.Vector3;
    }
    players: IPlayerState[],
    teams: {
        id: number;
        score: number;
    }[],
    timer: string;
}

export interface IPlayerState {
    id: string;
    teamId: number;
    name: string;
    position?: BABYLON.Vector3;
    velocity?: BABYLON.Vector3;
    ping?: number;
}

export interface IGameOptions {
    canvas?: HTMLCanvasElement,
    isServer?: boolean
}

export interface IGameMode {
    name: 'Soccer' | 'Beach Volley' | 'Practice' | 'Title Screen';
    fieldWidth?: number;
    fieldHeight?: number;
    time?: number; //seconds
}

export interface IGInfo {
    gameMode: IGameMode,
    playerId: string;
}

export interface IInputMap {
    [key: string]: number;
}
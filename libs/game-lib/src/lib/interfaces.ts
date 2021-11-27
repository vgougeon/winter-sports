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
    delta: number;
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

export interface IQueueState {
    position: number;
    inQueue: number;
    gameModes: number[];
    inQueue1v1: number;
    inQueue2v2: number;
    inQueue3v3: number;
}
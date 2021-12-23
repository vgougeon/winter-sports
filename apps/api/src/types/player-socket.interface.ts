import { Socket } from "socket.io";

export interface PlayerSocket extends Socket {
    pseudo?: string;
    user?: any;
    ping?: number;
    gamesModes?: string[];
}
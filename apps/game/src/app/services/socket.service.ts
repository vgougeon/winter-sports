import { io, Socket } from "socket.io-client";

export class SocketService {
    socket: Socket;
    constructor() {
        this.socket = io("", { 
            path: '/api/socket/'
        });
    }
}

export default new SocketService()
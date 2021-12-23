import { io } from "../main";
import { PlayerSocket } from "../types/player-socket.interface";
import queue from "./queue/queue";

io.on('connection', (socket: PlayerSocket) => {
    console.log("New client", socket.id)

    socket.on('disconnect', () => {
        queue.removePlayer(socket)
        console.log("Client left", socket.id)
    })

    socket.on('queue', (gameModes: string[] = ['Soccer']) => {
        queue.addPlayer(socket, gameModes)
    })

    socket.on('pseudo', (pseudo: string) => {
        socket.pseudo = pseudo
        socket.emit('pseudoSet', pseudo)
    })

    socket.on('leaveQueue', () => {
        queue.removePlayer(socket)
    })
});
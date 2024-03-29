import express, { Application } from 'express';
import path from 'path';
import SocketIO from "socket.io";

const app: Application = express();

const cookieParser = require('cookie-parser')
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app);

export const io: SocketIO.Server = socketIO(server, {
  path: "/api/socket/",
  transports: ['websocket', 'polling'],
});

app.get('/api', (req, res) => {
  res.send({ version: process.env.NX_VERSION });
});

app.use('/', express.static(path.join(__dirname, '../game/')))
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../game/index.html'))
})

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


const port = process.env.PORT || 3333;

server.listen(port);

server.on('error', console.error);

require('./app/lifecycle')

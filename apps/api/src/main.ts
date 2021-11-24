import express, { Application } from 'express';
import SocketIO from "socket.io";
import { Game } from './app/game/game';

const app: Application = express();

const cookieParser = require('cookie-parser')
const socketIO = require('socket.io');
const http = require('http');
const server = http.createServer(app);

export const io: SocketIO.Server = socketIO(server, {
  path: "/api/socket/",
  transports: ['websocket', 'polling'],
  // cors: {
  //   origin: 'http://localhost:4200',
  //   methods: ["GET", "POST", "PUT", "PATCH"],
  //   credentials: true
  // }
});

app.get('/api', (req, res) => {
  res.send({ version: process.env.NX_VERSION });
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


const port = process.env.PORT || 3333;

server.listen(port);

server.on('error', console.error);

require('./app/lifecycle')

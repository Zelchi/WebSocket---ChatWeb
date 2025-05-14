import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';

class App {

    private app: Application;
    private http: http.Server;
    private io: Server;

    constructor() {
        this.app = express();
        this.http = http.createServer(this.app);
        this.io = new Server(this.http);
        this.listenServer();
        this.listenSocket();
        this.setupRoutes();
    }

    listenServer() {
        this.http.listen(3001, () => {
            console.log('Server is running on port 3001');
        });
    }

    listenSocket() {
        this.io.on('connection', (socket) => {
            console.log(socket.id);

            socket.on('message', (data) => {
                this.io.emit('message', data);
            })
        })
    }
    setupRoutes() {
        this.app.get('/', (req, res) => {
            res.sendFile(__dirname + '/index.html');
        })
    }
}

export default new App();
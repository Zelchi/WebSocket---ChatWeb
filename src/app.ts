import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

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
        this.http.listen(8080, () => {
            console.log('Server is running on port 8080');
        });
    }

    listenSocket() {
        const messages: { content: string; timestamp: number }[] = [];

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.emit('history', messages.map(msg => msg.content));

            socket.on('message', (data) => {
                const timestamp = Date.now();
                messages.push({ content: data, timestamp });

                this.io.emit('message', data);

                console.log(`Message received: ${data}`);

                const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
                while (messages.length > 0 && (messages[0]?.timestamp ?? Infinity) < thirtyMinutesAgo) {
                    messages.shift();
                }
            });
        });
    }
    setupRoutes() {
        this.app.get('/', (req, res) => {
            res.sendFile(__dirname + '/index.html');
        })
    }
}

export default new App();
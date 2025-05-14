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
        this.http.listen(3001, () => {
            console.log('Server is running on port 3001');
        });
    }

    listenSocket() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            const filePath = path.join(__dirname, '../chat-history.txt');
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (!err && data) {
                    const messages = data.split('\n').filter(line => line.trim() !== '');
                    socket.emit('history', messages);
                }
            });

            socket.on('message', (data) => {
                this.io.emit('message', data);

                console.log(`Message received: ${data}`);

                const logEntry = '\n' + data + '\n';
                fs.appendFile(filePath, logEntry, (err) => {
                    if (err) {
                        console.error('Failed to save message to history:', err);
                    }
                });
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
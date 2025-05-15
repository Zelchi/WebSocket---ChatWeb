import express, { Application } from 'express';
import { Server } from 'socket.io';
import http from 'http';

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
        const nicknames: { [key: string]: string } = {};

        const updateUserList = () => {
            this.io.emit('userList', nicknames);
        };

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            const userCount = this.io.of('/').sockets.size;
            console.log(`User count after connection: ${userCount}`);
            this.io.emit('userCount', userCount);

            socket.emit('history', messages.map(msg => msg.content));

            socket.on('nickname', (nickname) => {
                nicknames[socket.id] = nickname;
                console.log(`Nickname set for ${socket.id}: ${nickname}`);
                updateUserList();
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                delete nicknames[socket.id];
                updateUserList();

                const userCountAfterDisconnect = this.io.of('/').sockets.size;
                console.log(`User count after disconnect: ${userCountAfterDisconnect}`);
                this.io.emit('userCount', userCountAfterDisconnect);
            });

            socket.on('message', (data) => {
                const timestamp = Date.now();
                const nickname = nicknames[socket.id] || 'Unknown';
                const messageContent = `${nickname}: ${data}`;
                messages.push({ content: messageContent, timestamp });

                this.io.emit('message', messageContent);

                console.log(`Message received: ${messageContent}`);

                const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
                while (messages.length > 0 && (messages[0]?.timestamp ?? Infinity) < thirtyMinutesAgo) {
                    messages.shift();
                }
            });
        });
    }
    setupRoutes() {
        this.app.use(express.static(__dirname));

        this.app.get('/', (req, res) => {
            res.sendFile(__dirname + '/index.html');
        });
    }
}

export default new App();
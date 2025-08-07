import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
  },
})
export class GatewayService implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  userSocketMap: { [key: string]: string } = {};

  onModuleInit() {
    this.server.on('connection', (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) this.userSocketMap[userId] = socket.id;

      this.server.emit('onlineUsers', Object.keys(this.userSocketMap));

      socket.on('disconnect', () => {
        delete this.userSocketMap[userId];
        this.server.emit('onlineUsers', Object.keys(this.userSocketMap));
      });
    });
  }

  getReceiverSocketId(userId: string) {
    return this.userSocketMap[userId];
  }
}

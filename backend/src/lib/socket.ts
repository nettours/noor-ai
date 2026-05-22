// backend/src/lib/socket.ts
import { Server } from 'socket.io';

export function setupSocketIO(io: Server) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) socket.join(`user:${userId}`);
    socket.on('disconnect', () => {});
  });
}

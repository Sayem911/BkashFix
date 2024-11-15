import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export const initSocket = (server: NetServer) => {
  const io = new SocketIOServer(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room based on user role and ID
    socket.on('join', ({ userId, role }) => {
      if (role === 'admin') {
        socket.join('admin-room');
      } else if (role === 'reseller') {
        socket.join(`reseller-${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};
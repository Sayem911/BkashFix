const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room based on user role and ID
    socket.on('join', ({ userId, role }) => {
      // Join user-specific room
      socket.join(`user-${userId}`);

      // Join role-specific room
      if (role === 'admin') {
        socket.join('admin-room');
        // console.log('Admin joined admin-room');
      } else if (role === 'reseller') {
        socket.join(`reseller-${userId}`);
        // console.log('Reseller joined their room');
      } else if (role === 'customer') {
        socket.join(`customer-${userId}`);
        // console.log('Customer joined their room');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  // Make io available globally
  global.io = io;

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
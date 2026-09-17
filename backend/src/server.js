require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const initSocket = require('./socket');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

initSocket(io);

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   CORS allowed origin: ${CLIENT_URL}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const jwt = require('jsonwebtoken');

/**
 * Initializes Socket.IO auth + room-joining.
 * Each authenticated user joins a private room `user_<id>` so that
 * task events are only ever broadcast to that user's own connections
 * (supports multiple open tabs/devices per user).
 */
function initSocket(io) {
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const room = `user_${socket.user.id}`;
    socket.join(room);

    socket.on('disconnect', () => {
      socket.leave(room);
    });
  });
}

module.exports = initSocket;

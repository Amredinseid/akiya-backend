import express from 'express';

const router = express.Router();

// Simple test endpoint
router.get('/ping', (req, res) => {
  res.send('✅ Delivery route is active!');
});

// Live driver location simulation function
export function setupDeliverySocket(io) {
  let lat = 9.03;
  let lng = 38.74;

  io.on('connection', (socket) => {
    console.log('🚗 Client connected to delivery tracking:', socket.id);

    // Send location every 5 seconds
    const interval = setInterval(() => {
      lat += 0.0001; // Simulate driver movement
      lng += 0.0001;

      const location = { lat, lng };
      socket.emit('driverLocation', location); // Only to connected client
      socket.broadcast.emit('driverLocation', location); // To all clients

      console.log('📍 Emitting driverLocation:', location);
    }, 5000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('❌ Client disconnected from delivery:', socket.id);
    });
  });
}

export default router;

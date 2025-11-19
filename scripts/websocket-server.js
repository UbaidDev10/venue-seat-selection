import { WebSocketServer } from 'ws';

const PORT = 8080; // WebSocket server port
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server started on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Listen for seat selection messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // If client sends a seat selection, broadcast it to all other clients
      if (data.seatId && data.status) {
        console.log(`Broadcasting: ${data.seatId} -> ${data.status}`);
        
        // Broadcast to all connected clients except the sender
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) { // 1 = OPEN
            client.send(JSON.stringify({
              seatId: data.seatId,
              status: data.status
            }));
          }
        });
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log(`\nServer ready. Clients can connect to: ws://localhost:${PORT}/ws`);
console.log('The server will broadcast seat selections to all connected clients.\n');


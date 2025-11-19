# WebSocket Setup Guide

## How to Connect WebSocket

The app automatically tries to connect to a WebSocket server for live seat status updates.

## Quick Start

1. **Install WebSocket dependency** (if not already installed):
   ```bash
   pnpm install
   ```

2. **Start the WebSocket server** (in a separate terminal):
   ```bash
   pnpm run ws-server
   ```
   This will start a WebSocket server on `ws://localhost:8080`

3. **Start the app** (in another terminal):
   ```bash
   pnpm run dev
   ```

4. **Check the connection**: 
   - Look at the header - you should see a green dot with "Live updates" when connected
   - Open browser console to see connection logs

## What the WebSocket Server Does

The test server (`scripts/websocket-server.js`) simulates seat status updates by:
- Sending random seat status changes every 5 seconds
- Updating seats like: `A-1-01`, `A-1-02`, etc.
- Changing statuses to: `available`, `reserved`, `sold`, `held`

## Message Format

The WebSocket expects messages in this JSON format:
```json
{
  "seatId": "A-1-01",
  "status": "sold"
}
```

## Custom WebSocket Server

If you want to use your own WebSocket server, make sure:
1. It listens on port 8080 (or update the port in `App.tsx`)
2. It sends messages in the format: `{ seatId: string, status: SeatStatus }`
3. The status must be one of: `"available"`, `"reserved"`, `"sold"`, `"held"`

## Testing Without a Server

If no WebSocket server is running:
- The app will try to connect 3 times
- After that, it will hide the connection status indicator
- The app works normally without WebSocket - live updates are optional

## Production Setup

For production, you'll need to:
1. Set up a proper WebSocket server (Node.js, Python, etc.)
2. Update the WebSocket URL in `App.tsx` if needed
3. Use `wss://` (secure WebSocket) for HTTPS sites


# Venue Seat Selector

An interactive React + TypeScript application for selecting seats in an event venue. The application renders a seating map with ~17,500 seats, supports selecting up to 8 seats, and provides a smooth 60fps experience.

## Quick Start

```bash
pnpm install && pnpm dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

## Tech Stack

- **React 19.2** - UI framework
- **TypeScript 5.9** (strict mode enabled) - Type safety
- **Vite 7.2** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **WebSocket (ws)** - Real-time seat status updates

## Architecture

### Component-Based Architecture
- **Modular Components**: Separated into reusable UI components (`components/`)
- **Custom Hooks**: Business logic extracted into custom hooks (`hooks/`)
- **Utilities**: Helper functions for data manipulation (`utils/`)
- **Constants**: Centralized configuration (`constants/`)
- **Index Exports**: Clean imports via barrel exports

### Key Design Decisions

**SVG Rendering**: Used SVG over Canvas for native accessibility, keyboard navigation, and simpler event handling. Performs smoothly with 15,000+ seats.

**State Management**: React hooks (`useState`, `useCallback`, `useMemo`) for local state. No external state library needed for this scope.

**Performance**: Memoization, viewport-based rendering, and optimized re-renders ensure 60fps with large datasets.

**Persistence**: localStorage for seat selection persistence across page reloads.

## Requirements Checklist

### Core Requirements ✅

- [x] **Load `venue.json`** - Supports both `venue.json` and `venue-generated.json` with fallback
- [x] **Render all seats** - SVG-based rendering with correct positioning
- [x] **Smooth 60fps** - Optimized for ~15,000+ seats on mid-range hardware
- [x] **Mouse & Keyboard Selection** - Click and keyboard (Enter/Space) support
- [x] **Seat Details Display** - Shows section, row, seat number, price tier, and status
- [x] **Select up to 8 seats** - Validation and live counter
- [x] **Selection Summary** - Live subtotal calculation and seat list
- [x] **localStorage Persistence** - Selections persist across page reloads
- [x] **Accessibility** - `aria-label`, keyboard navigation, focus indicators
- [x] **Responsive Design** - Works on desktop and mobile viewports

### Stretch Goals ✅

- [x] **Live WebSocket Updates** - Real-time seat status changes with animation
- [x] **Heat-map Toggle** - Color seats by price tier
- [x] **Find Seat** - Search and focus specific seats by ID
- [x] **Pinch-Zoom & Pan** - Touch gestures for mobile navigation
- [x] **Dark Mode** - WCAG 2.1 AA compliant dark theme toggle
- [ ] **E2E Tests** - Not implemented (unit tests recommended)

## Project Structure

```
src/
├── components/          # UI components
│   ├── index.ts        # Barrel exports
│   ├── Header.tsx
│   ├── SeatMap.tsx
│   ├── Seat.tsx
│   ├── SeatDetails.tsx
│   ├── SelectionSummary.tsx
│   ├── SeatMapControls.tsx
│   ├── DarkModeToggle.tsx
│   ├── WebSocketStatus.tsx
│   ├── Legend.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   └── SuccessToast.tsx
├── hooks/              # Custom React hooks
│   ├── index.ts
│   ├── useDarkMode.ts
│   ├── useVenue.ts
│   ├── useSeatSelection.ts
│   ├── useWebSocket.ts
│   └── useSeatSearch.ts
├── utils/              # Utility functions
│   ├── index.ts
│   ├── storage.ts
│   └── seatUtils.ts
├── constants/          # App constants
│   └── index.ts
├── types.ts           # TypeScript definitions
├── App.tsx            # Main application
└── main.tsx           # Entry point
```

## Features

### Core Features
- **Interactive Seat Map**: Click or use keyboard to select seats
- **Seat Details Panel**: View seat information when focused
- **Selection Summary**: Track selected seats with live subtotal
- **Persistence**: Selections saved to localStorage
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive**: Mobile and desktop optimized

### Advanced Features
- **Real-time Updates**: WebSocket integration for live seat status changes
- **Heat-map View**: Toggle to visualize seats by price tier
- **Seat Search**: Find and focus specific seats by ID
- **Touch Gestures**: Pinch-zoom and pan for mobile devices
- **Dark Mode**: System-aware dark theme with WCAG 2.1 AA compliance

## WebSocket Setup

To enable live seat updates, start the WebSocket server:

```bash
pnpm ws-server
```

The server runs on `ws://localhost:8080` and broadcasts seat status changes to all connected clients.

See `WEBSOCKET_SETUP.md` for detailed setup instructions.

## Venue Data Generation

The project includes utility scripts to generate large-scale venue data for performance testing:

### Generate Large Venue (`generate-seats`)

The `generate-seats.js` script creates a `venue-generated.json` file with approximately 15,000 seats across multiple sections. This is used to test the application's performance with large datasets as specified in the requirements.

**Why it's needed:**
- The default `venue.json` contains a small sample dataset
- Performance requirements specify smooth rendering with ~15,000 seats
- Allows testing real-world scenarios with large arenas
- Validates that optimizations (memoization, viewport rendering) work at scale

**Usage:**
```bash
pnpm generate-seats
```

This creates `public/venue-generated.json` with a realistic venue layout. The application automatically prefers `venue-generated.json` over `venue.json` if available, with a fallback mechanism.

### Delete Generated Venue (`delete-seats`)

To remove the generated file and revert to the default small dataset:

```bash
pnpm delete-seats
```

This is useful for:
- Reducing repository size if committing generated files
- Testing with the original sample data
- Resetting to a clean state

**Note:** The application works with both files. If `venue-generated.json` exists, it's used; otherwise, it falls back to `venue.json`. This allows flexibility between development (small dataset) and performance testing (large dataset).


import { useState, useEffect, useRef } from "react";
import type { Venue } from "../types";
import {
  MAX_WEBSOCKET_RECONNECT_ATTEMPTS,
  WEBSOCKET_RECONNECT_DELAY,
} from "../constants";

export const useWebSocket = (
  venue: Venue | null,
  onVenueUpdate: (updater: (prev: Venue | null) => Venue | null) => void
) => {
  const [wsConnected, setWsConnected] = useState(false);
  const [wsAttempted, setWsAttempted] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!venue) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost =
      window.location.hostname === "localhost"
        ? "localhost:8080"
        : window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    let reconnectAttempts = 0;

    const connect = () => {
      try {
        setWsAttempted(true);
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          reconnectAttempts = 0;
          console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.seatId && data.status) {
              onVenueUpdate((prevVenue) => {
                if (!prevVenue) return prevVenue;

                const updatedVenue = { ...prevVenue };
                let seatUpdated = false;

                updatedVenue.sections = updatedVenue.sections.map(
                  (section) => ({
                    ...section,
                    rows: section.rows.map((row) => ({
                      ...row,
                      seats: row.seats.map((seat) => {
                        if (seat.id === data.seatId) {
                          seatUpdated = true;
                          return { ...seat, status: data.status };
                        }
                        return seat;
                      }),
                    })),
                  })
                );

                return seatUpdated ? updatedVenue : prevVenue;
              });
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setWsConnected(false);
        };

        ws.onclose = () => {
          setWsConnected(false);

          if (reconnectAttempts < MAX_WEBSOCKET_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(
              `WebSocket disconnected, attempting to reconnect... (${reconnectAttempts}/${MAX_WEBSOCKET_RECONNECT_ATTEMPTS})`
            );
            reconnectTimeout = window.setTimeout(connect, WEBSOCKET_RECONNECT_DELAY);
          } else {
            console.log(
              "WebSocket connection failed after max attempts. Live updates disabled."
            );
            setWsAttempted(false);
          }
        };
      } catch (err) {
        console.error("WebSocket connection error:", err);
        setWsConnected(false);

        if (reconnectAttempts < MAX_WEBSOCKET_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          reconnectTimeout = window.setTimeout(connect, WEBSOCKET_RECONNECT_DELAY);
        } else {
          setWsAttempted(false);
        }
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [venue, onVenueUpdate]);

  const sendMessage = (seatId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          seatId,
          status: "reserved",
        })
      );
    }
  };

  return { wsConnected, wsAttempted, sendMessage };
};


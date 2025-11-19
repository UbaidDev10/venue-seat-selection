import { useState, useEffect, useCallback } from "react";
import type { Venue, SelectedSeat } from "../types";
import { storage } from "../utils/storage";
import { validatePersistedSeats } from "../utils/seatUtils";
import { MAX_SELECTED_SEATS } from "../constants";

export const useSeatSelection = (venue: Venue | null) => {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [focusedSeat, setFocusedSeat] = useState<SelectedSeat | null>(null);

  // Load persisted selection from localStorage after venue is loaded
  useEffect(() => {
    if (!venue) return;

    const stored = storage.get();
    if (stored) {
      const validSeats = validatePersistedSeats(stored, venue);
      if (validSeats.length > 0) {
        setSelectedSeats(validSeats);
      }
    }
  }, [venue]);

  // Persist selection to localStorage whenever it changes
  useEffect(() => {
    if (!venue) return;
    storage.set(selectedSeats);
  }, [selectedSeats, venue]);

  const handleSeatSelect = useCallback(
    (seat: SelectedSeat, onWebSocketSend?: (seatId: string) => void) => {
      // Only allow selection of available or held seats
      if (seat.status !== "available" && seat.status !== "held") {
        return;
      }

      setSelectedSeats((prev) => {
        const isAlreadySelected = prev.some((s) => s.id === seat.id);

        if (isAlreadySelected) {
          return prev.filter((s) => s.id !== seat.id);
        }

        if (prev.length >= MAX_SELECTED_SEATS) {
          return prev;
        }

        // Send seat selection to WebSocket server
        if (onWebSocketSend) {
          onWebSocketSend(seat.id);
        }

        return [...prev, seat];
      });

      // Keep the seat focused after selection
      setFocusedSeat(seat);
    },
    []
  );

  const handleRemoveSeat = useCallback((seatId: string) => {
    setSelectedSeats((prev) => prev.filter((s) => s.id !== seatId));
  }, []);

  const handleSeatFocus = useCallback((seat: SelectedSeat | null) => {
    setFocusedSeat(seat);
  }, []);

  return {
    selectedSeats,
    focusedSeat,
    handleSeatSelect,
    handleRemoveSeat,
    handleSeatFocus,
    setFocusedSeat,
  };
};


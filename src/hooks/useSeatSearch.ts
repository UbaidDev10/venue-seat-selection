import { useState, useCallback } from "react";
import type { Venue, SelectedSeat } from "../types";
import { findSeatById } from "../utils/seatUtils";

export const useSeatSearch = (
  venue: Venue | null,
  onSeatFound: (seat: SelectedSeat) => void
) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = useCallback(() => {
    if (!venue || !searchInput.trim()) return;

    const seat = findSeatById(venue, searchInput);
    if (seat) {
      onSeatFound(seat);
      setSearchInput("");
    } else {
      alert(
        `Seat "${searchInput}" not found. Please check the seat ID and try again.`
      );
    }
  }, [venue, searchInput, onSeatFound]);

  return {
    searchInput,
    setSearchInput,
    handleSearch,
  };
};


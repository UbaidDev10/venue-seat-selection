import type { Venue, SelectedSeat } from "../types";

/**
 * Validates that persisted seats still exist in the venue
 */
export const validatePersistedSeats = (
  seats: SelectedSeat[],
  venue: Venue
): SelectedSeat[] => {
  const seatIdMap = new Map<string, boolean>();

  // Build a map of all seat IDs in the venue
  venue.sections.forEach((section) => {
    section.rows.forEach((row) => {
      row.seats.forEach((seat) => {
        seatIdMap.set(seat.id, true);
      });
    });
  });

  // Only keep seats that still exist in the venue
  return seats.filter((seat) => seatIdMap.has(seat.id));
};

/**
 * Finds a seat by ID in the venue
 */
export const findSeatById = (
  venue: Venue,
  seatId: string
): SelectedSeat | null => {
  const searchId = seatId.trim().toUpperCase();

  for (const section of venue.sections) {
    for (const row of section.rows) {
      for (const seat of row.seats) {
        if (seat.id.toUpperCase() === searchId) {
          return {
            ...seat,
            sectionId: section.id,
            sectionLabel: section.label,
            rowIndex: row.index,
          };
        }
      }
    }
  }

  return null;
};


import type { SelectedSeat } from "../types";

const STORAGE_KEY = "venue-seat-selector-selection";

export const storage = {
  get: (): SelectedSeat[] | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Failed to load from localStorage:", err);
      return null;
    }
  },

  set: (seats: SelectedSeat[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seats));
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  },

  remove: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to remove from localStorage:", err);
    }
  },
};

export type SeatStatus = 'available' | 'reserved' | 'sold' | 'held';

export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: SeatStatus;
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface Section {
  id: string;
  label: string;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  rows: Row[];
}

export interface Venue {
  venueId: string;
  name: string;
  map: {
    width: number;
    height: number;
  };
  sections: Section[];
}

export interface SelectedSeat extends Seat {
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
}

// Price mapping for tiers (since actual prices aren't provided)
export const PRICE_TIERS: Record<number, number> = {
  1: 50,
  2: 75,
  3: 100,
  4: 150,
};


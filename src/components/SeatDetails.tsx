import type { SelectedSeat } from "../types";
import { PRICE_TIERS } from "../types";

interface SeatDetailsProps {
  seat: SelectedSeat | null;
  onSelectSeat?: (seat: SelectedSeat) => void;
  isSelected?: boolean;
}

const STATUS_LABELS_MAP: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  held: "Held",
};

export default function SeatDetails({
  seat,
  onSelectSeat,
  isSelected = false,
}: SeatDetailsProps) {
  if (!seat) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Click or focus on a seat to view details
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
          💡 Tip: Only green (Available) and purple (Held) seats can be selected
        </p>
      </div>
    );
  }

  const price = PRICE_TIERS[seat.priceTier] ?? 50;
  const canSelect = seat.status === "available" || seat.status === "held";

  const statusColors: Record<string, string> = {
    available:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700",
    reserved:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    sold: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
    held: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
  };

  const statusColor =
    statusColors[seat.status] ??
    "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600";

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
      <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
        Seat Details
      </h3>
      <dl className="space-y-2">
        <div>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Seat ID
          </dt>
          <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono">
            {seat.id}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Section
          </dt>
          <dd className="text-sm text-gray-900 dark:text-gray-100">
            {seat.sectionLabel}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Row
          </dt>
          <dd className="text-sm text-gray-900 dark:text-gray-100">
            {seat.rowIndex}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Seat Number
          </dt>
          <dd className="text-sm text-gray-900 dark:text-gray-100">
            {seat.col}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Price Tier
          </dt>
          <dd className="text-sm text-gray-900 dark:text-gray-100">
            Tier {seat.priceTier}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Price
          </dt>
          <dd className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ${price}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Status
          </dt>
          <dd
            className={`text-sm font-semibold px-2 py-1 rounded border inline-block ${statusColor}`}
          >
            {STATUS_LABELS_MAP[seat.status] ?? seat.status}
          </dd>
        </div>
      </dl>

      {!canSelect && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            ⚠️ This seat cannot be selected. Only <strong>Available</strong>{" "}
            (green) or <strong>Held</strong> (purple) seats can be selected.
          </p>
        </div>
      )}

      {canSelect && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✅ This seat is available for selection.
            </p>
          </div>
          <button
            onMouseDown={(e) => {
              // Prevent this from causing the seat to lose focus
              e.preventDefault();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isSelected && onSelectSeat && seat) {
                // Select the seat and keep it focused
                onSelectSeat(seat);
              }
            }}
            type="button"
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              isSelected || !onSelectSeat
                ? "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-60"
                : "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 active:bg-blue-800 dark:active:bg-blue-700 cursor-pointer"
            }`}
            aria-disabled={isSelected || !onSelectSeat}
          >
            {isSelected ? "✓ Seat Selected" : "Select This Seat"}
          </button>
        </div>
      )}
    </div>
  );
}

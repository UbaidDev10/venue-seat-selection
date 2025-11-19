import type { SelectedSeat } from '../types';
import { PRICE_TIERS } from '../types';

interface SelectionSummaryProps {
  selectedSeats: SelectedSeat[];
  onRemoveSeat: (seatId: string) => void;
}

export default function SelectionSummary({
  selectedSeats,
  onRemoveSeat,
}: SelectionSummaryProps) {
  const subtotal = selectedSeats.reduce((sum, seat) => {
    const price = PRICE_TIERS[seat.priceTier] ?? 50;
    return sum + price;
  }, 0);

  const maxSeats = 8;
  const remainingSeats = maxSeats - selectedSeats.length;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Your Selection</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {selectedSeats.length} / {maxSeats} seats
        </span>
      </div>

      {selectedSeats.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No seats selected</p>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {selectedSeats.map((seat) => {
              const price = PRICE_TIERS[seat.priceTier] ?? 50;
              return (
                <div
                  key={seat.id}
                  className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{seat.id}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {seat.sectionLabel} • Row {seat.rowIndex} • Seat {seat.col}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">${price}</span>
                    <button
                      onClick={() => onRemoveSeat(seat.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded px-2 py-1"
                      aria-label={`Remove seat ${seat.id}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${subtotal.toFixed(2)}</span>
            </div>
            {remainingSeats > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can select {remainingSeats} more seat{remainingSeats !== 1 ? 's' : ''}
              </p>
            )}
            {remainingSeats === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Maximum seats selected (8)
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}


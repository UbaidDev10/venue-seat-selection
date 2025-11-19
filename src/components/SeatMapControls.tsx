import Legend from "./Legend";

interface SeatMapControlsProps {
  showHeatMap: boolean;
  onToggleHeatMap: () => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
}

export default function SeatMapControls({
  showHeatMap,
  onToggleHeatMap,
  searchInput,
  onSearchInputChange,
  onSearch,
}: SeatMapControlsProps) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Seating Map
        </h2>
        <div className="flex items-center gap-4">
          {/* Heat-map Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Heat-map:
            </label>
            <button
              onClick={onToggleHeatMap}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showHeatMap
                  ? "bg-blue-600 dark:bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              role="switch"
              aria-checked={showHeatMap}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform ${
                  showHeatMap ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {/* Find Seat Helper */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Find Seat:
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch();
                }
              }}
              placeholder="e.g., A-1-01"
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-32"
            />
            <button
              onClick={onSearch}
              className="px-3 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Find
            </button>
          </div>
        </div>
        <Legend showHeatMap={showHeatMap} />
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded border border-blue-200 dark:border-blue-800">
        💡 <strong>How to use:</strong> Click on green (Available) or purple
        (Held) seats to select. Scroll to navigate the map. You can select up
        to 8 seats.
      </p>
    </div>
  );
}


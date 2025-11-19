import { useState } from "react";
import type { SelectedSeat } from "./types";
import {
  useDarkMode,
  useVenue,
  useSeatSelection,
  useWebSocket,
  useSeatSearch,
} from "./hooks";
import {
  Header,
  SeatMap,
  SeatDetails,
  SelectionSummary,
  SeatMapControls,
  LoadingState,
  ErrorState,
  SuccessToast,
} from "./components";
import { SUCCESS_ALERT_DURATION } from "./constants";

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { venue, loading, error, setVenue } = useVenue();
  const {
    selectedSeats,
    focusedSeat,
    handleSeatSelect,
    handleRemoveSeat,
    handleSeatFocus,
    setFocusedSeat,
  } = useSeatSelection(venue);

  const { wsConnected, wsAttempted, sendMessage } = useWebSocket(
    venue,
    setVenue
  );

  const { searchInput, setSearchInput, handleSearch } = useSeatSearch(
    venue,
    setFocusedSeat
  );

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);

  // Handle seat selection with WebSocket and success alert
  const handleSeatSelectWithAlert = (seat: SelectedSeat) => {
    handleSeatSelect(seat, sendMessage);
    setShowSuccessAlert(true);
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, SUCCESS_ALERT_DURATION);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !venue) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {showSuccessAlert && <SuccessToast />}

      <Header
        venue={venue}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        wsConnected={wsConnected}
        wsAttempted={wsAttempted}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <SeatMapControls
                showHeatMap={showHeatMap}
                onToggleHeatMap={() => setShowHeatMap(!showHeatMap)}
                searchInput={searchInput}
                onSearchInputChange={setSearchInput}
                onSearch={handleSearch}
              />
              <div
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto"
                style={{ height: "600px", maxHeight: "70vh" }}
              >
                <SeatMap
                  venue={venue}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelectWithAlert}
                  focusedSeat={focusedSeat}
                  onSeatFocus={handleSeatFocus}
                  showHeatMap={showHeatMap}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Seat Details and Summary */}
          <div className="space-y-6">
            <SeatDetails
              seat={focusedSeat}
              onSelectSeat={handleSeatSelectWithAlert}
              isSelected={
                focusedSeat
                  ? selectedSeats.some((s) => s.id === focusedSeat.id)
                  : false
              }
              selectedSeatsCount={selectedSeats.length}
            />
            <SelectionSummary
              selectedSeats={selectedSeats}
              onRemoveSeat={handleRemoveSeat}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

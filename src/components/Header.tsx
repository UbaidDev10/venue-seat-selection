import type { Venue } from "../types";
import { MAX_SELECTED_SEATS } from "../constants";
import DarkModeToggle from "./DarkModeToggle";
import WebSocketStatus from "./WebSocketStatus";

interface HeaderProps {
  venue: Venue;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  wsConnected: boolean;
  wsAttempted: boolean;
}

export default function Header({
  venue,
  darkMode,
  onToggleDarkMode,
  wsConnected,
  wsAttempted,
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {venue.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select up to {MAX_SELECTED_SEATS} seats
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
            <WebSocketStatus connected={wsConnected} attempted={wsAttempted} />
          </div>
        </div>
      </div>
    </header>
  );
}


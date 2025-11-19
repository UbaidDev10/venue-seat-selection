import { memo, useState, useEffect, useRef } from "react";
import type { Seat as SeatType, SelectedSeat } from "../types";
import { PRICE_TIERS } from "../types";

interface SeatProps {
  seat: SeatType;
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
  isSelected: boolean;
  onSelect: (seat: SelectedSeat) => void;
  onFocus: (seat: SelectedSeat | null) => void;
  focusedSeat: SelectedSeat | null;
  onHover?: (
    seat: SelectedSeat | null,
    event: React.MouseEvent<SVGGElement>
  ) => void;
  showHeatMap?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  available: "#10b981", // green
  reserved: "#f59e0b", // amber
  sold: "#ef4444", // red
  held: "#6366f1", // indigo
};

// Price tier colors for heat-map (from low to high price)
const PRICE_TIER_COLORS: Record<number, string> = {
  1: "#3b82f6", // blue - lowest price
  2: "#10b981", // green
  3: "#f59e0b", // amber
  4: "#ef4444", // red - highest price
};

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  held: "Held",
};

const Seat = memo(
  function Seat({
    seat,
    sectionId,
    sectionLabel,
    rowIndex,
    isSelected,
    onSelect: _onSelect, // Not used - selection is done via button in right panel
    onFocus,
    focusedSeat,
    onHover,
    showHeatMap = false,
  }: SeatProps) {
    const canSelect = seat.status === "available" || seat.status === "held";
    const price = PRICE_TIERS[seat.priceTier] ?? 50;
    const [isHovered, setIsHovered] = useState(false);
    const [isStatusUpdated, setIsStatusUpdated] = useState(false);
    const prevStatusRef = useRef(seat.status);

    // Detect status changes and trigger animation
    useEffect(() => {
      if (prevStatusRef.current !== seat.status) {
        setIsStatusUpdated(true);
        prevStatusRef.current = seat.status;
        const timer = setTimeout(() => setIsStatusUpdated(false), 500);
        return () => clearTimeout(timer);
      }
    }, [seat.status]);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const seatData = {
        ...seat,
        sectionId,
        sectionLabel,
        rowIndex,
      };

      // Clicking a seat should ONLY focus it (show dashed border)
      // Selection is done via button in the right panel
      onFocus(seatData);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        // Enter key should select the seat (handled by parent container)
        // But also ensure the seat is focused first
        const seatData = {
          ...seat,
          sectionId,
          sectionLabel,
          rowIndex,
        };
        onFocus(seatData);
      }
    };

    const handleFocus = () => {
      // This is called by browser focus events (keyboard navigation)
      // Only focus if not already focused
      if (focusedSeat?.id !== seat.id) {
        onFocus({
          ...seat,
          sectionId,
          sectionLabel,
          rowIndex,
        });
      }
    };

    const handleBlur = (e: React.FocusEvent) => {
      // Don't clear focus if the blur is caused by clicking on a button or interactive element
      // This prevents the panel from disappearing when clicking the "Select Seat" button
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (
        relatedTarget &&
        (relatedTarget.tagName === "BUTTON" ||
          relatedTarget.closest("button") ||
          relatedTarget.closest('[role="button"]'))
      ) {
        // Keep focus when clicking buttons - don't clear it
        return;
      }

      // Don't automatically clear focus - let the App component manage it
      // This ensures focus is maintained after selection via the button
    };

    // Fill color based on heat-map mode or status
    const fillColor = showHeatMap
      ? PRICE_TIER_COLORS[seat.priceTier] ?? "#6b7280" // Use price tier color in heat-map mode
      : isSelected
      ? "#3b82f6" // Blue-500 for selected (matches header legend)
      : STATUS_COLORS[seat.status] ?? "#6b7280"; // Use status color in normal mode

    // Opacity
    const opacity = isSelected ? 1.0 : canSelect ? 0.8 : 0.5;

    // Check if seat is focused (regardless of selection state)
    const isFocused = focusedSeat?.id === seat.id;

    // Stroke styling priority:
    // 1. If focused: black dashed outline (shows on top of everything)
    // 2. If selected but not focused: green solid border
    // 3. Otherwise: none
    let strokeColor = "none";
    let strokeWidth = 0;
    let strokeDasharray = "none";

    if (isFocused) {
      // Black dashed outline when focused (appears on both selected and unselected seats)
      strokeColor = "#000000";
      strokeWidth = 2;
      strokeDasharray = "4,2"; // Dashed pattern
    } else if (isSelected) {
      // Green solid border when selected but not focused
      strokeColor = "#10b981";
      strokeWidth = 1.5;
    }

    // Hover scale (5% increase = 1.05)
    const scale = isHovered ? 1.05 : 1;
    const transform = `translate(${seat.x}, ${
      seat.y
    }) scale(${scale}) translate(${-seat.x}, ${-seat.y})`;

    return (
      <g
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={(e) => {
          setIsHovered(true);
          if (onHover) {
            onHover(
              {
                ...seat,
                sectionId,
                sectionLabel,
                rowIndex,
              },
              e
            );
          }
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          if (onHover) {
            onHover(null, e);
          }
        }}
        onMouseMove={(e) => {
          if (onHover) {
            onHover(
              {
                ...seat,
                sectionId,
                sectionLabel,
                rowIndex,
              },
              e
            );
          }
        }}
        tabIndex={canSelect ? 0 : -1}
        style={{ outline: "none" }}
        className={
          canSelect
            ? "cursor-pointer focus:outline-none focus:ring-0"
            : "cursor-not-allowed"
        }
        aria-label={`Seat ${seat.id}, ${sectionLabel}, Row ${rowIndex}, Seat ${
          seat.col
        }, ${STATUS_LABELS[seat.status]}, $${price}`}
        role="button"
        aria-pressed={isSelected}
        aria-disabled={!canSelect}
      >
        <g transform={transform}>
          <circle
            cx={seat.x}
            cy={seat.y}
            r={4}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
            filter={isHovered ? "url(#seat-shadow)" : undefined}
            style={{
              outline: "none",
              border: "none",
              transition:
                "transform 0.2s ease, filter 0.2s ease, fill 0.3s ease",
            }}
            className={`seat-circle ${isStatusUpdated ? "status-updated" : ""}`}
          />
        </g>
      </g>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for performance - return true if props are equal (skip re-render)
    return (
      prevProps.seat.id === nextProps.seat.id &&
      prevProps.seat.x === nextProps.seat.x &&
      prevProps.seat.y === nextProps.seat.y &&
      prevProps.seat.status === nextProps.seat.status &&
      prevProps.seat.priceTier === nextProps.seat.priceTier &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.showHeatMap === nextProps.showHeatMap &&
      (prevProps.focusedSeat?.id ?? null) ===
        (nextProps.focusedSeat?.id ?? null)
    );
  }
);

export default Seat;

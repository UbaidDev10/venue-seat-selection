import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import type { Venue, SelectedSeat } from "../types";
import { PRICE_TIERS } from "../types";
import { MAX_SELECTED_SEATS } from "../constants";
import Seat from "./Seat";

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  held: "Held",
};

interface SeatMapProps {
  venue: Venue;
  selectedSeats: SelectedSeat[];
  onSeatSelect: (seat: SelectedSeat) => void;
  focusedSeat: SelectedSeat | null;
  onSeatFocus: (seat: SelectedSeat | null) => void;
  showHeatMap?: boolean;
}

export default function SeatMap({
  venue,
  selectedSeats,
  onSeatSelect,
  focusedSeat,
  onSeatFocus,
  showHeatMap = false,
}: SeatMapProps) {
  const [hoveredSeat, setHoveredSeat] = useState<SelectedSeat | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const hoverTimeoutRef = useRef<number | null>(null);

  // Touch gesture state for mobile
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const touchStateRef = useRef<{
    isPanning: boolean;
    isZooming: boolean;
    lastTouchDistance: number;
    lastPanPoint: { x: number; y: number } | null;
    initialZoom: number;
    initialPan: { x: number; y: number };
  }>({
    isPanning: false,
    isZooming: false,
    lastTouchDistance: 0,
    lastPanPoint: null,
    initialZoom: 1,
    initialPan: { x: 0, y: 0 },
  });

  const selectedSeatIds = useMemo(
    () => new Set(selectedSeats.map((s) => s.id)),
    [selectedSeats]
  );

  // Calculate actual bounds from seat positions and normalize to start from 0,0
  const mapBounds = useMemo(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    venue.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.seats.forEach((seat) => {
          minX = Math.min(minX, seat.x);
          minY = Math.min(minY, seat.y);
          maxX = Math.max(maxX, seat.x);
          maxY = Math.max(maxY, seat.y);
        });
      });
    });

    const seatRadius = 4;
    const padding = seatRadius + 5; // Small padding from edges
    const labelPadding = 20; // Space for row/column labels

    return {
      minX: 0,
      minY: 0,
      maxX: maxX - minX + padding * 2 + labelPadding,
      maxY: maxY - minY + padding * 2 + labelPadding,
      width: maxX - minX + padding * 2 + labelPadding,
      height: maxY - minY + padding * 2 + labelPadding,
      offsetX: minX - padding - labelPadding,
      offsetY: minY - padding - labelPadding,
      labelPadding,
    };
  }, [venue]);

  // Scale factor to make seats appear larger with better spacing
  // Seats are 8px radius, 20px apart (from venue.json)
  // At 5x scale: visual radius = 40px, visual spacing = 100px, clear space = 20px
  // This makes seats clearly visible, readable, and prevents overlap
  const scale = 5;
  const scaledWidth = mapBounds.width * scale;
  const scaledHeight = mapBounds.height * scale;

  // Track viewport for viewport-based rendering optimization
  useEffect(() => {
    const updateViewport = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewport({
          x: containerRef.current.scrollLeft / scale,
          y: containerRef.current.scrollTop / scale,
          width: rect.width / scale,
          height: rect.height / scale,
        });
      }
    };

    updateViewport();
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateViewport, { passive: true });
      window.addEventListener("resize", updateViewport, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", updateViewport);
        window.removeEventListener("resize", updateViewport);
      }
    };
  }, [scale]);

  // Pre-compute all seats with normalized positions for performance
  const normalizedSeats = useMemo(() => {
    const seats: Array<{
      seat: SelectedSeat;
      normalizedX: number;
      normalizedY: number;
    }> = [];

    venue.sections.forEach((section) => {
      section.rows.forEach((row) => {
        row.seats.forEach((seat) => {
          seats.push({
            seat: {
              ...seat,
              sectionId: section.id,
              sectionLabel: section.label,
              rowIndex: row.index,
            },
            normalizedX: seat.x - mapBounds.offsetX,
            normalizedY: seat.y - mapBounds.offsetY,
          });
        });
      });
    });

    return seats;
  }, [venue, mapBounds.offsetX, mapBounds.offsetY]);

  // Filter seats to only render those in viewport (with padding for smooth scrolling)
  const visibleSeats = useMemo(() => {
    const padding = 50; // Extra padding to render seats slightly outside viewport
    return normalizedSeats.filter(
      ({ normalizedX, normalizedY }) =>
        normalizedX >= viewport.x - padding &&
        normalizedX <= viewport.x + viewport.width + padding &&
        normalizedY >= viewport.y - padding &&
        normalizedY <= viewport.y + viewport.height + padding
    );
  }, [normalizedSeats, viewport]);

  // Extract label from seat ID (e.g., "A-3-03" -> section: "A", row: "3", column: "03")
  const extractLabelsFromSeatId = (
    seatId: string
  ): { section: string; row: string; column: string } | null => {
    // Seat ID format: "SECTION-ROW-SEAT" (e.g., "A-3-03")
    const parts = seatId.split("-");
    if (parts.length >= 3) {
      return {
        section: parts[0], // Section (e.g., "A")
        row: parts[1], // Row number (e.g., "3")
        column: parts[2], // Seat number/column (e.g., "03")
      };
    }
    return null;
  };

  // Calculate column and row labels from seat IDs
  const { columnLabels, rowLabels } = useMemo(() => {
    const labelPadding = mapBounds.labelPadding;
    const columnMap = new Map<string, { label: string; x: number }>(); // column label -> {label, x}
    const rowMap = new Map<string, { label: string; y: number }>(); // row label -> {label, y}
    const tolerance = 5; // Group seats within this distance

    normalizedSeats.forEach(({ seat, normalizedX, normalizedY }) => {
      const labels = extractLabelsFromSeatId(seat.id);
      if (!labels) return;

      // For columns: find the X position for this column label
      const existingCol = columnMap.get(labels.column);
      if (!existingCol || Math.abs(existingCol.x - normalizedX) < tolerance) {
        columnMap.set(labels.column, { label: labels.column, x: normalizedX });
      }

      // For rows: create a key with section and row (e.g., "A-3")
      const rowKey = `${labels.section}-${labels.row}`;
      const rowLabel = `${labels.section}-${labels.row}`;
      const existingRow = rowMap.get(rowKey);
      if (!existingRow || Math.abs(existingRow.y - normalizedY) < tolerance) {
        rowMap.set(rowKey, { label: rowLabel, y: normalizedY });
      }
    });

    // Convert to arrays and sort, adding labelPadding for positioning
    const columns = Array.from(columnMap.values())
      .map(({ label, x }) => ({
        label,
        x: x + labelPadding,
      }))
      .sort((a, b) => {
        // Sort by numeric value if possible, otherwise alphabetically
        const numA = parseInt(a.label, 10);
        const numB = parseInt(b.label, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.label.localeCompare(b.label);
      });

    const rows = Array.from(rowMap.values())
      .map(({ label, y }) => ({
        label,
        y: y + labelPadding,
      }))
      .sort((a, b) => {
        // Sort by numeric value if possible, otherwise alphabetically
        const numA = parseInt(a.label, 10);
        const numB = parseInt(b.label, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.label.localeCompare(b.label);
      });

    return {
      columnLabels: columns,
      rowLabels: rows,
    };
  }, [normalizedSeats, mapBounds.labelPadding]);

  // Find next seat in direction for keyboard navigation
  const findNextSeat = useCallback(
    (direction: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") => {
      if (!focusedSeat) {
        // If no seat is focused, focus the first selectable seat
        const firstSeat = normalizedSeats.find(
          (s) => s.seat.status === "available" || s.seat.status === "held"
        );
        if (firstSeat) {
          onSeatFocus(firstSeat.seat);
        }
        return;
      }

      const currentSeat = normalizedSeats.find(
        (s) => s.seat.id === focusedSeat.id
      );
      if (!currentSeat) return;

      const { normalizedX: currentX, normalizedY: currentY } = currentSeat;
      const threshold = 20; // Distance threshold for finding seats in same row/column

      let candidates: Array<{
        seat: SelectedSeat;
        normalizedX: number;
        normalizedY: number;
        distance: number;
      }> = [];

      normalizedSeats.forEach(({ seat, normalizedX, normalizedY }) => {
        // Skip non-selectable seats
        if (seat.status !== "available" && seat.status !== "held") return;
        // Skip current seat
        if (seat.id === focusedSeat.id) return;

        let distance = 0;
        let isValid = false;

        switch (direction) {
          case "ArrowUp":
            // Find seats above (smaller Y, similar X)
            if (
              normalizedY < currentY &&
              Math.abs(normalizedX - currentX) < threshold
            ) {
              distance = currentY - normalizedY;
              isValid = true;
            }
            break;
          case "ArrowDown":
            // Find seats below (larger Y, similar X)
            if (
              normalizedY > currentY &&
              Math.abs(normalizedX - currentX) < threshold
            ) {
              distance = normalizedY - currentY;
              isValid = true;
            }
            break;
          case "ArrowLeft":
            // Find seats to the left (smaller X, similar Y)
            if (
              normalizedX < currentX &&
              Math.abs(normalizedY - currentY) < threshold
            ) {
              distance = currentX - normalizedX;
              isValid = true;
            }
            break;
          case "ArrowRight":
            // Find seats to the right (larger X, similar Y)
            if (
              normalizedX > currentX &&
              Math.abs(normalizedY - currentY) < threshold
            ) {
              distance = normalizedX - currentX;
              isValid = true;
            }
            break;
        }

        if (isValid) {
          candidates.push({ seat, normalizedX, normalizedY, distance });
        }
      });

      // Sort by distance and pick the closest
      if (candidates.length > 0) {
        candidates.sort((a, b) => a.distance - b.distance);
        const nextSeat = candidates[0].seat;
        onSeatFocus(nextSeat);

        // Scroll to the focused seat
        const seatData = normalizedSeats.find((s) => s.seat.id === nextSeat.id);
        if (seatData && containerRef.current) {
          const scrollX =
            seatData.normalizedX * scale - containerRef.current.clientWidth / 2;
          const scrollY =
            seatData.normalizedY * scale -
            containerRef.current.clientHeight / 2;
          containerRef.current.scrollTo({
            left: Math.max(0, scrollX),
            top: Math.max(0, scrollY),
            behavior: "smooth",
          });
        }
      }
    },
    [focusedSeat, normalizedSeats, onSeatFocus, scale]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        // Only handle if focus is within the seat map container
        const target = e.target as HTMLElement;
        if (containerRef.current && containerRef.current.contains(target)) {
          e.preventDefault();
          e.stopPropagation();
          findNextSeat(
            e.key as "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"
          );
        }
      } else if (e.key === "Enter" && focusedSeat) {
        // Enter key should select the focused seat
        const target = e.target as HTMLElement;
        if (
          containerRef.current &&
          containerRef.current.contains(target) &&
          (focusedSeat.status === "available" || focusedSeat.status === "held") &&
          selectedSeats.length < MAX_SELECTED_SEATS
        ) {
          e.preventDefault();
          e.stopPropagation();
          onSeatSelect(focusedSeat);
        }
      }
    },
    [findNextSeat, focusedSeat, onSeatSelect, selectedSeats.length]
  );

  // Set up keyboard event listener on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Scroll to focused seat when it changes (e.g., from find seat feature)
  useEffect(() => {
    if (!focusedSeat || !containerRef.current) return;

    // Find the seat in normalized seats
    const seatData = normalizedSeats.find((s) => s.seat.id === focusedSeat.id);
    if (seatData) {
      // Small delay to ensure the seat is rendered
      setTimeout(() => {
        if (containerRef.current) {
          const scrollX =
            seatData.normalizedX * scale - containerRef.current.clientWidth / 2;
          const scrollY =
            seatData.normalizedY * scale -
            containerRef.current.clientHeight / 2;
          containerRef.current.scrollTo({
            left: Math.max(0, scrollX),
            top: Math.max(0, scrollY),
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [focusedSeat?.id, normalizedSeats, scale]);

  // Debounced hover handler for performance
  const handleHover = useCallback(
    (
      seat: SelectedSeat | null,
      event: React.MouseEvent<SVGGElement> | null
    ) => {
      // Clear any pending hover updates
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      if (!seat || !event) {
        setHoveredSeat(null);
        return;
      }

      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        setHoveredSeat(seat);

        if (containerRef.current) {
          // Get mouse position relative to viewport
          const mouseX = event.clientX;
          const mouseY = event.clientY;

          // Tooltip dimensions (approximate)
          const tooltipWidth = 140;
          const tooltipHeight = 120;
          const offset = 15;

          // Calculate position using fixed positioning (relative to viewport)
          let x = mouseX + offset;
          let y = mouseY - tooltipHeight - offset;

          // Check if tooltip would overflow right edge of viewport
          if (x + tooltipWidth > window.innerWidth) {
            x = mouseX - tooltipWidth - offset;
          }

          // Check if tooltip would overflow left edge of viewport
          if (x < 0) {
            x = offset;
          }

          // Check if tooltip would overflow top edge of viewport
          if (y < 0) {
            y = mouseY + offset;
          }

          // Check if tooltip would overflow bottom edge of viewport
          if (y + tooltipHeight > window.innerHeight) {
            y = window.innerHeight - tooltipHeight - offset;
          }

          setTooltipPosition({ x, y });
        }
      });
    },
    []
  );

  // Calculate distance between two touch points
  const getTouchDistance = (
    touch1: React.Touch,
    touch2: React.Touch
  ): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get center point between two touches
  const getTouchCenter = (
    touch1: React.Touch,
    touch2: React.Touch
  ): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - start panning
        const touch = e.touches[0];
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          touchStateRef.current.isPanning = true;
          touchStateRef.current.lastPanPoint = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          };
          touchStateRef.current.initialPan = { ...pan };
        }
      } else if (e.touches.length === 2) {
        // Two touches - start zooming
        e.preventDefault();
        touchStateRef.current.isZooming = true;
        touchStateRef.current.isPanning = false;
        touchStateRef.current.lastTouchDistance = getTouchDistance(
          e.touches[0],
          e.touches[1]
        );
        touchStateRef.current.initialZoom = zoom;
        touchStateRef.current.initialPan = { ...pan };
      }
    },
    [pan, zoom]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStateRef.current.isZooming && e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleChange =
        currentDistance / touchStateRef.current.lastTouchDistance;
      const newZoom = Math.max(
        0.5,
        Math.min(3, touchStateRef.current.initialZoom * scaleChange)
      );
      setZoom(newZoom);

      // Adjust pan to zoom around the center point
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = center.x - rect.left;
        const centerY = center.y - rect.top;
        const zoomRatio = newZoom / touchStateRef.current.initialZoom;
        const newPanX =
          centerX - (centerX - touchStateRef.current.initialPan.x) * zoomRatio;
        const newPanY =
          centerY - (centerY - touchStateRef.current.initialPan.y) * zoomRatio;
        setPan({ x: newPanX, y: newPanY });
      }
    } else if (touchStateRef.current.isPanning && e.touches.length === 1) {
      // Pan
      e.preventDefault();
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && touchStateRef.current.lastPanPoint) {
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        const deltaX = currentX - touchStateRef.current.lastPanPoint.x;
        const deltaY = currentY - touchStateRef.current.lastPanPoint.y;
        setPan({
          x: touchStateRef.current.initialPan.x + deltaX,
          y: touchStateRef.current.initialPan.y + deltaY,
        });
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current.isPanning = false;
    touchStateRef.current.isZooming = false;
    touchStateRef.current.lastPanPoint = null;
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-50 dark:bg-gray-900 relative focus:outline-none"
      tabIndex={0}
      role="application"
      aria-label="Seat map - Use arrow keys to navigate, Enter to select. Pinch to zoom, drag to pan on mobile."
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: "none",
        userSelect: "none",
        overflow: zoom !== 1 || pan.x !== 0 || pan.y !== 0 ? "hidden" : "auto",
      }}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: scaledWidth,
          height: scaledHeight,
        }}
      >
        <svg
          width={scaledWidth}
          height={scaledHeight}
          viewBox={`0 0 ${mapBounds.width} ${mapBounds.height}`}
          style={{
            display: "block",
          }}
          preserveAspectRatio="none"
          aria-label={`Seating map for ${venue.name}`}
          role="img"
        >
          {/* Shared shadow filter for hover effects */}
          <defs>
            <filter
              id="seat-shadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Column labels at the top */}
          {columnLabels.map(({ label, x }, index) => (
            <text
              key={`col-${label}-${x}-${index}`}
              x={x}
              y={mapBounds.labelPadding / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] fill-gray-600 dark:fill-gray-400 font-medium pointer-events-none select-none"
            >
              {label}
            </text>
          ))}

          {/* Row labels on the left */}
          {rowLabels.map(({ label, y }, index) => (
            <text
              key={`row-${label}-${y}-${index}`}
              x={mapBounds.labelPadding / 2}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] fill-gray-600 dark:fill-gray-400 font-medium pointer-events-none select-none"
            >
              {label}
            </text>
          ))}

          {/* Optimized: Only render visible seats */}
          {visibleSeats.map(({ seat, normalizedX, normalizedY }) => (
            <Seat
              key={seat.id}
              seat={{
                ...seat,
                x: normalizedX + mapBounds.labelPadding,
                y: normalizedY + mapBounds.labelPadding,
              }}
              sectionId={seat.sectionId}
              sectionLabel={seat.sectionLabel}
              rowIndex={seat.rowIndex}
              isSelected={selectedSeatIds.has(seat.id)}
              onSelect={onSeatSelect}
              onFocus={onSeatFocus}
              focusedSeat={focusedSeat}
              onHover={handleHover}
              showHeatMap={showHeatMap}
            />
          ))}
        </svg>
      </div>
      {/* Tooltip rendered outside SVG with fixed positioning to avoid clipping */}
      {hoveredSeat && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-[10px] rounded shadow-lg p-2 leading-tight pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            minWidth: "140px",
          }}
        >
          <div className="space-y-0.5">
            <div className="flex justify-between gap-2">
              <span className="text-gray-400 dark:text-gray-300">Section:</span>
              <span className="font-medium">{hoveredSeat.sectionLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400 dark:text-gray-300">Row:</span>
              <span className="font-medium">{hoveredSeat.rowIndex}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400 dark:text-gray-300">Seat:</span>
              <span className="font-medium">{hoveredSeat.col}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400 dark:text-gray-300">Price:</span>
              <span className="font-medium">
                ${PRICE_TIERS[hoveredSeat.priceTier] ?? 50}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-400 dark:text-gray-300">Status:</span>
              <span className="font-medium">
                {STATUS_LABELS[hoveredSeat.status]}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

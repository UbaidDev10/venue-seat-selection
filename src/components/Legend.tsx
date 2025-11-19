interface LegendProps {
  showHeatMap: boolean;
}

export default function Legend({ showHeatMap }: LegendProps) {
  if (showHeatMap) {
    return (
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-900 dark:text-gray-100">Tier 1 ($50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-900 dark:text-gray-100">Tier 2 ($75)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-900 dark:text-gray-100">Tier 3 ($100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-900 dark:text-gray-100">Tier 4 ($150)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Available
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
        <span className="font-medium text-gray-900 dark:text-gray-100">Held</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
        <span className="text-gray-900 dark:text-gray-100">Reserved</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-gray-900 dark:text-gray-100">Sold</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-700 dark:border-blue-400"></div>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Selected
        </span>
      </div>
    </div>
  );
}


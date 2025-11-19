interface WebSocketStatusProps {
  connected: boolean;
  attempted: boolean;
}

export default function WebSocketStatus({
  connected,
  attempted,
}: WebSocketStatusProps) {
  if (!attempted) return null;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {connected ? "Live updates" : "Connecting..."}
      </span>
    </div>
  );
}


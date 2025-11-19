interface SuccessToastProps {
  message?: string;
}

export default function SuccessToast({
  message = "Seat selected successfully!",
}: SuccessToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}


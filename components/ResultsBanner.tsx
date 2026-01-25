interface ResultsBannerProps {
  modelsFound: number;
  onClose: () => void;
}

export default function ResultsBanner({ modelsFound, onClose }: ResultsBannerProps) {
  return (
    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-600"
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
        </div>
        <div>
          <h3 className="font-semibold text-green-800">Search complete</h3>
          <p className="text-sm text-green-700 mt-1">
            Models found: <span className="font-medium">{modelsFound}</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-green-600 hover:text-green-800 transition-colors"
        aria-label="Close results"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

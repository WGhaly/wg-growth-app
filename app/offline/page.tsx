export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">You're Offline</h1>
        
        <p className="text-text-secondary mb-8">
          It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-accent-primary text-bg-primary px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-opacity"
        >
          Try Again
        </button>

        <div className="mt-8 p-4 bg-bg-secondary rounded-lg">
          <h2 className="font-semibold mb-2">Available Offline</h2>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• View previously loaded pages</li>
            <li>• Browse cached content</li>
            <li>• Access saved data</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

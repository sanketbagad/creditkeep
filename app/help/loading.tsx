export default function HelpLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>

          {/* Cards skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

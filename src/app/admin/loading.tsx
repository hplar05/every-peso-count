export default function AdminLoading() {
  return (
    <div className="max-w-6xl animate-pulse">
      <div className="mb-6">
        <div className="h-7 bg-gray-200 rounded-sm w-40 mb-2" />
        <div className="h-4 bg-gray-100 rounded-sm w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
            <div className="h-4 bg-gray-100 rounded-sm w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded-sm w-32" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans animate-pulse">
      <header className="bg-[#1E3A5F] py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20" />
            <div>
              <div className="h-4 bg-white/20 rounded-sm w-36 mb-1" />
              <div className="h-3 bg-white/10 rounded-sm w-24" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-4 bg-white/20 rounded-sm w-16" />
            <div className="h-4 bg-white/20 rounded-sm w-16" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-6 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-sm w-60 mb-3" />
          <div className="h-4 bg-gray-100 rounded-sm w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
              <div className="h-5 bg-gray-200 rounded-sm w-20 mb-3" />
              <div className="h-6 bg-gray-200 rounded-sm w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded-sm w-4/5 mb-2" />
              <div className="h-4 bg-gray-100 rounded-sm w-3/5 mb-4" />
              <div className="h-2 bg-gray-200 rounded-full w-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

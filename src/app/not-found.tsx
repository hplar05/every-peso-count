import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center font-sans p-6">
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-10 max-w-lg w-full text-center">
        <div className="text-6xl font-medium text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-medium text-[#1E3A5F] tracking-tight mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  )
}

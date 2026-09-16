'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center font-sans p-6">
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-10 max-w-lg w-full text-center">
        <div className="text-5xl font-medium text-gray-200 mb-4">500</div>
        <h1 className="text-2xl font-medium text-[#1E3A5F] tracking-tight mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-8">
          An unexpected error occurred. Please try again. If the problem persists, contact the barangay office.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <Link href="/" className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-sm hover:bg-gray-200 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

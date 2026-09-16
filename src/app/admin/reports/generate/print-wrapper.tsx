'use client'

import { useEffect } from 'react'

export function PrintWrapper() {
  useEffect(() => {
    // Small delay to ensure images/fonts load
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="print:hidden bg-blue-50 text-blue-800 p-4 mb-8 rounded-sm text-sm border border-blue-200 flex justify-between items-center">
      <span>This report is optimized for printing. Ensure "Background graphics" is enabled in your print dialog.</span>
      <button 
        onClick={() => window.print()} 
        className="px-4 py-1.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors"
      >
        Print Again
      </button>
    </div>
  )
}

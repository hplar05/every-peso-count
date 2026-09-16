'use client'

import { useState } from 'react'
import { FileText, Printer } from 'lucide-react'

export default function ReportsConfigurationPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [includeProjects, setIncludeProjects] = useState(true)
  const [includeBudget, setIncludeBudget] = useState(true)
  const [includeAttendance, setIncludeAttendance] = useState(true)

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Construct query parameters
    const params = new URLSearchParams()
    if (dateFrom) params.append('from', dateFrom)
    if (dateTo) params.append('to', dateTo)
    params.append('projects', includeProjects.toString())
    params.append('budget', includeBudget.toString())
    params.append('attendance', includeAttendance.toString())

    // Open print view in new tab
    window.open(`/admin/reports/generate?${params.toString()}`, '_blank')
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Generate Official Reports</h2>
        <p className="text-gray-600">Configure and generate printable PDF reports for barangay transparency.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-[#F5F7FA] rounded-sm flex items-center justify-center text-[#2563EB]">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-medium text-[#172033]">Transparency Summary Report</h3>
            <p className="text-sm text-gray-500">Comprehensive overview of barangay activities.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          
          <div>
            <h4 className="text-sm font-medium text-[#1E3A5F] mb-3">1. Select Date Range (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Leave blank to include all historical data.</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#1E3A5F] mb-3">2. Select Modules to Include</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-sm hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={includeProjects} 
                  onChange={e => setIncludeProjects(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                />
                <div>
                  <div className="text-sm font-medium text-[#172033]">Project Status Summaries</div>
                  <div className="text-xs text-gray-500">Includes all active and completed projects and their milestones.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-sm hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={includeBudget} 
                  onChange={e => setIncludeBudget(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                />
                <div>
                  <div className="text-sm font-medium text-[#172033]">Financial & Budget Overview</div>
                  <div className="text-xs text-gray-500">Total allocations, expenditures, and remaining balances.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-sm hover:bg-gray-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={includeAttendance} 
                  onChange={e => setIncludeAttendance(e.target.checked)}
                  className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                />
                <div>
                  <div className="text-sm font-medium text-[#172033]">Kagawad Attendance Scorecard</div>
                  <div className="text-xs text-gray-500">Attendance records for all Sangguniang Barangay sessions.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-colors"
            >
              <Printer size={16} />
              Generate & Print Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

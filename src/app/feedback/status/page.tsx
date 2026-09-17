'use client'

import { useState, useTransition } from 'react'
import { checkFeedbackStatus } from '../actions'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, Clock, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CheckFeedbackStatusPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<any>(null)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const res = await checkFeedbackStatus(formData)
        if (res?.error) {
          setError(res.error)
          toast.error(res.error)
        } else if (res?.success) {
          setResult(res.data)
          toast.success('Tracking record found.')
        }
      } catch (err) {
        const msg = 'An unexpected error occurred while checking status.'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending Review', color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock }
      case 'in_review':
        return { label: 'In Review', color: 'text-[#F4B942]', bg: 'bg-yellow-50', icon: FileText }
      case 'resolved':
        return { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 }
      default:
        return { label: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock }
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      <header className="bg-[#1E3A5F] py-4 px-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
              <Image src="/logo.jpg" alt="Barangay Bella Luz Logo" width={32} height={32} className="object-cover" />
            </div>
            <h1 className="font-medium text-lg tracking-tight text-white">Barangay Bella Luz</h1>
          </div>
          <Link href="/feedback" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Hub
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-6 py-12">
        <div className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Check Ticket Status</h2>
            <p className="text-gray-600 mt-1">Enter the 8-character tracking code you received when submitting your feedback.</p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <input
              name="tracking_code"
              type="text"
              required
              maxLength={8}
              placeholder="e.g. A1B2C3D4"
              className="flex-1 px-4 py-2.5 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm font-mono uppercase tracking-widest placeholder:tracking-normal placeholder:normal-case"
            />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex justify-center items-center gap-2 px-8 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Search size={16} />
              {isPending ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-red-600 text-sm font-medium text-center bg-red-50 py-2 border border-red-200 rounded-sm">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Current Status</h3>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-sm font-medium border ${result.status === 'resolved' ? 'border-green-200 bg-green-50 text-green-700' : result.status === 'in_review' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                  {getStatusDisplay(result.status).label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Submitted On</div>
                <div className="text-sm text-[#172033] font-medium">{new Date(result.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Official Response</h3>
              
              {result.response ? (
                <div className="bg-[#F5F7FA] p-5 rounded-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">
                      {result.officials?.name?.charAt(0) || 'O'}
                    </div>
                    <div className="text-sm font-medium text-[#1E3A5F]">
                      {result.officials?.role === 'admin' ? 'Barangay Admin' : `Barangay ${result.officials?.role || 'Official'}`}
                    </div>
                  </div>
                  <p className="text-[#172033] text-sm whitespace-pre-wrap leading-relaxed">
                    {result.response}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 p-8 text-center rounded-sm">
                  <p className="text-gray-500 text-sm">
                    No response has been provided yet. Your inquiry is currently in our queue.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

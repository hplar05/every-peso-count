'use client'

import { useState } from 'react'
import { submitFeedback } from '../actions'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function SubmitFeedbackPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [trackingCode, setTrackingCode] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await submitFeedback(formData)
    
    if (result.error) {
      setError(result.error)
      toast.error(result.error)
    } else if (result.success && result.tracking_code) {
      setTrackingCode(result.tracking_code)
      toast.success('Feedback submitted. Your tracking code has been generated.')
    }
    
    setIsPending(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      <header className="bg-[#1E3A5F] py-4 px-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-medium text-lg tracking-tight text-white">Barangay Bella Luz</h1>
          <Link href="/feedback" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Hub
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-6 py-12">
        {trackingCode ? (
          <div className="bg-white border border-green-200 p-8 rounded-sm shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight mb-2">Feedback Submitted</h2>
            <p className="text-gray-600 mb-6">
              Thank you for reaching out to us. We will review your message shortly.
            </p>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-sm inline-block mx-auto mb-8">
              <div className="text-xs uppercase tracking-wider text-green-800 font-semibold mb-1">Your Tracking Code</div>
              <div className="text-3xl font-bold tracking-widest text-[#1E3A5F]">{trackingCode}</div>
            </div>
            
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
              Please save this tracking code. You can use it to check the status of your inquiry and read the official response.
            </p>

            <Link href="/feedback" className="inline-flex items-center justify-center px-6 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 transition-colors">
              Return to Hub
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Submit Inquiry</h2>
              <p className="text-gray-600 mt-1">Please provide the details of your concern. You may remain anonymous.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 flex items-start gap-3">
                <ShieldAlert size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5">
                    Your Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    name="resident_name"
                    type="text"
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5">
                    Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                    placeholder="For notification when resolved"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  minLength={5}
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                  placeholder="Describe your concern, question, or feedback in detail..."
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Note: Profane or inappropriate language will be automatically blocked by our system.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full md:w-auto inline-flex justify-center items-center px-8 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isPending ? 'Validating & Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

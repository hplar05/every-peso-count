import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Home, MessageSquare, Search, Send, CheckCircle2 } from 'lucide-react'

export default async function PublicFeedbackPage() {
  const supabase = await createClient()

  // Fetch resolved feedback for the public board
  // Only fetching where status = 'resolved' due to RLS policies
  const { data: feedbacks } = await supabase
    .from('feedback')
    .select(`
      id,
      message,
      response,
      created_at,
      officials (
        name,
        role
      )
    `)
    .eq('status', 'resolved')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1E3A5F] text-white py-4 px-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
              <Image src="/logo.jpg" alt="Barangay Bella Luz Logo" width={40} height={40} className="object-cover" />
            </div>
            <div>
              <div className="font-medium text-lg tracking-tight leading-tight">Barangay Bella Luz</div>
              <div className="text-xs text-[#F4B942]">Transparency Portal</div>
            </div>
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Home size={16} /> Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 py-8">
        
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-[#2563EB] mb-2">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-3xl font-medium text-[#1E3A5F] tracking-tight mb-4">Citizens Feedback & Inquiries</h1>
          <p className="text-gray-600 text-lg">
            We value your voice. Submit concerns, ask questions, or report issues directly to the barangay officials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          <Link href="/feedback/submit" className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm hover:border-[#2563EB] hover:shadow-md transition-all group flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center text-[#2563EB] mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
              <Send size={24} />
            </div>
            <h2 className="text-xl font-medium text-[#1E3A5F] mb-2">Submit New Feedback</h2>
            <p className="text-gray-500 text-sm">Send a message to your Kagawads. You can choose to remain anonymous.</p>
          </Link>

          <Link href="/feedback/status" className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm hover:border-[#2563EB] hover:shadow-md transition-all group flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center text-[#2563EB] mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
              <Search size={24} />
            </div>
            <h2 className="text-xl font-medium text-[#1E3A5F] mb-2">Check Ticket Status</h2>
            <p className="text-gray-500 text-sm">Enter your tracking code to view the status and official response to your inquiry.</p>
          </Link>
        </div>

        {/* Public Board */}
        <div>
          <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-gray-200">
            <CheckCircle2 size={24} className="text-green-600" />
            <h2 className="text-2xl font-medium text-[#1E3A5F]">Resolved Public Inquiries</h2>
          </div>

          {(!feedbacks || feedbacks.length === 0) ? (
            <div className="bg-white border border-gray-200 p-12 text-center rounded-sm text-gray-500 shadow-sm">
              No resolved public inquiries to display at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedbacks.map(feedback => (
                <div key={feedback.id} className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 flex flex-col">
                  <div className="mb-4 flex-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                      Resident Inquiry
                    </div>
                    <p className="text-[#172033] whitespace-pre-wrap line-clamp-4">
                      "{feedback.message}"
                    </p>
                  </div>
                  
                  <div className="bg-[#F5F7FA] p-4 rounded-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">
                        {(Array.isArray(feedback.officials) ? feedback.officials[0]?.name : (feedback.officials as any)?.name)?.charAt(0) || 'O'}
                      </div>
                      <div className="text-sm font-medium text-[#1E3A5F]">
                        {(() => {
                          const role = Array.isArray(feedback.officials) ? feedback.officials[0]?.role : (feedback.officials as any)?.role
                          return role === 'admin' ? 'Barangay Admin' : `Barangay ${role || 'Official'}`
                        })()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {feedback.response}
                    </p>
                  </div>
                  
                  <div className="mt-4 text-right text-xs text-gray-400">
                    Resolved on {new Date(feedback.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

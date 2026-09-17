import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Home, MessageSquare, Search, Send } from 'lucide-react'

export const metadata = {
  title: "Feedback Hub",
  description: "Submit feedback or check the status of your request to Barangay Bella Luz.",
}

export default async function PublicFeedbackPage() {
  const supabase = await createClient()

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
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

          <Link href="/feedback/board" className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm hover:border-[#2563EB] hover:shadow-md transition-all group flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center text-[#2563EB] mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-xl font-medium text-[#1E3A5F] mb-2">Public Feedback Board</h2>
            <p className="text-gray-500 text-sm">Browse all resolved inquiries and official responses from the barangay.</p>
          </Link>
        </div>
      </main>
    </div>
  )
}

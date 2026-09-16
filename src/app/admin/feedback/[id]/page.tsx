import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { FeedbackManager } from './feedback-manager'

export default async function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: feedback } = await supabase
    .from('feedback')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!feedback) redirect('/admin/feedback')

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Inquiry Details</h2>
          <p className="text-gray-600">Review and official response.</p>
        </div>
        <Link 
          href="/admin/feedback"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Inbox
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-[#F5F7FA] rounded-full flex items-center justify-center text-[#2563EB]">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-medium text-[#172033]">Resident Message</h3>
                <p className="text-xs text-gray-500">Submitted on {new Date(feedback.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-[#F5F7FA] p-5 rounded-sm border border-gray-100 mb-6">
              <p className="text-[#172033] whitespace-pre-wrap leading-relaxed text-sm">
                {feedback.message}
              </p>
            </div>

            <FeedbackManager feedback={feedback} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Submitter Details
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Name</div>
                <div className="font-medium text-[#172033]">{feedback.resident_name || <span className="text-gray-400 italic">Anonymous</span>}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="font-medium text-[#172033]">{feedback.email || <span className="text-gray-400 italic">Not provided</span>}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Tracking Code</div>
                <div className="font-mono font-bold text-[#1E3A5F] bg-gray-50 p-1.5 rounded-sm border border-gray-200 inline-block">{feedback.tracking_code}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

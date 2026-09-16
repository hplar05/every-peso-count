import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Clock, FileText, CheckCircle2, ChevronRight } from 'lucide-react'

export const metadata = {
  title: "Feedback",
  description: "Review and respond to citizen feedback submissions.",
}

export default async function FeedbackInboxPage() {
  const supabase = await createClient()

  const { data: feedbacks } = await supabase
    .from('feedback')
    .select(`
      id,
      tracking_code,
      message,
      status,
      created_at,
      resident_name
    `)
    .order('created_at', { ascending: false })

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending':
        return { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock }
      case 'in_review':
        return { label: 'In Review', color: 'text-[#F4B942]', bg: 'bg-yellow-50', icon: FileText }
      case 'resolved':
        return { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 }
      default:
        return { label: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock }
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Citizens Inbox</h2>
        <p className="text-gray-600">Review and respond to resident inquiries and feedback.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        {(!feedbacks || feedbacks.length === 0) ? (
          <div className="p-12 text-center text-gray-500">
            No feedback found. The inbox is empty.
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Tracking Code</th>
                <th className="px-6 py-4">Resident</th>
                <th className="px-6 py-4">Message Preview</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feedbacks.map(f => {
                const s = getStatusDisplay(f.status)
                return (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-[#1E3A5F]">{f.tracking_code}</td>
                    <td className="px-6 py-4 text-gray-700">{f.resident_name || <span className="text-gray-400 italic">Anonymous</span>}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{f.message}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium border ${s.color} ${s.bg} border-gray-200`}>
                          <s.icon size={12} /> {s.label}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{new Date(f.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/feedback/${f.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

'use client'

import { useActionState } from 'react'
import { sendNotification } from './actions'
import { Bell, Send } from 'lucide-react'
import { toast } from 'sonner'

const initialState: { error: string; success?: undefined } | { success: boolean; error?: undefined } = { error: '', success: undefined }

export default function NotificationsPage() {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await sendNotification(formData)
    if (res.success) {
      toast.success('Announcement sent successfully.')
      const form = document.getElementById('notification-form') as HTMLFormElement
      if (form) form.reset()
    } else if (res.error) {
      toast.error(res.error)
    }
    return res
  }, initialState)

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Announcements & Notifications</h2>
        <p className="text-gray-600">Send official announcements via email to barangay officials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm p-6">
          <h3 className="text-lg font-medium text-[#1E3A5F] mb-4 flex items-center gap-2">
            <Send size={18} className="text-[#2563EB]" />
            Compose Message
          </h3>
          
          <form id="notification-form" action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">
                Announcement Type
              </label>
              <input
                name="type"
                type="text"
                required
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="e.g. Session Reminder, Urgent Advisory"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">
                Message Body
              </label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="Enter the full announcement details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">
                Recipient Scope
              </label>
              <select
                name="recipient_scope"
                required
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
              >
                <option value="officials">All Barangay Officials</option>
                <option value="public">Public (Website Notice Board)</option>
                <option value="all">Everyone</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Note: Email is sent immediately upon dispatch.
              </p>
            </div>

            {state?.error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="p-3 bg-green-50 border-l-4 border-green-600 text-green-800 text-sm">
                Notification dispatched successfully!
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {isPending ? 'Sending...' : 'Dispatch Notification'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <h3 className="text-sm font-medium text-[#1E3A5F] mb-2 flex items-center gap-2">
              <Bell size={16} className="text-[#F4B942]" />
              System Automated Alerts
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              The system also sends automatic notifications for:
            </p>
            <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4">
              <li>When a new session is scheduled.</li>
              <li>When a citizen feedback is marked as resolved (if email provided).</li>
              <li>When a project's budget crosses critical thresholds.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { updateFeedback } from '../actions'

export function FeedbackManager({ feedback }: { feedback: any }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        const res = await updateFeedback(feedback.id, formData)
        if (res?.error) {
          setError(res.error)
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#172033] mb-1.5">
          Official Response
        </label>
        <textarea
          name="response"
          rows={6}
          defaultValue={feedback.response || ''}
          className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
          placeholder="Write the official response here..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#172033] mb-1.5">
            Status
          </label>
          <select
            name="status"
            defaultValue={feedback.status}
            className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
          >
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {feedback.email && (
        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-sm border border-blue-100">
          Note: This resident provided an email address. Marking this as "Resolved" will automatically send them a notification containing your response.
        </p>
      )}

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {isPending ? 'Saving...' : 'Save & Update Status'}
        </button>
      </div>
    </form>
  )
}

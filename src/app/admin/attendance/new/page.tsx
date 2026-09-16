'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createSession } from '../actions'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const initialState: any = { error: null, success: false, id: null }

export default function NewSessionPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await createSession(formData)
    if (res.success && res.id) {
      router.push(`/admin/attendance/${res.id}`)
    }
    return res
  }, initialState)

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/attendance" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2563EB] mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Sessions
        </Link>
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Schedule New Session</h2>
        <p className="text-gray-600">Create a new Sangguniang Barangay session.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
        <form action={formAction} className="space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="title">
                Session Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="e.g. 1st Regular Session of the Month"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="session_date">
                  Date *
                </label>
                <input
                  id="session_date"
                  name="session_date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="type">
                  Session Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue="regular"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                >
                  <option value="regular">Regular Session</option>
                  <option value="special">Special Session</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="agenda">
                Agenda *
              </label>
              <textarea
                id="agenda"
                name="agenda"
                required
                rows={5}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="List the topics to be discussed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="status">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                defaultValue="scheduled"
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link 
              href="/admin/attendance"
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              {isPending ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

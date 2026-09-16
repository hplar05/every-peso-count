'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createProject } from '../actions'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const initialState: { error: string; success?: undefined; id?: undefined } | { success: boolean; id: any; error?: undefined } = { error: '', success: undefined, id: undefined }

export default function NewProjectPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await createProject(formData)
    if (res.success && res.id) {
      router.push(`/admin/projects/${res.id}`)
    }
    return res
  }, initialState)

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2563EB] mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </Link>
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Create New Project</h2>
        <p className="text-gray-600">Enter the details for the new barangay project.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
        <form action={formAction} className="space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="name">
                Project Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="e.g. Road Concreting at Purok 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="Briefly describe the project goals and impact."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="status">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue="planning"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                >
                  <option value="planning">Planning</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="budget_allocated">
                  Allocated Budget (PHP) *
                </label>
                <input
                  id="budget_allocated"
                  name="budget_allocated"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue="0"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="start_date">
                  Start Date
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="target_date">
                  Target Completion Date
                </label>
                <input
                  id="target_date"
                  name="target_date"
                  type="date"
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                />
              </div>
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link 
              href="/admin/projects"
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              {isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

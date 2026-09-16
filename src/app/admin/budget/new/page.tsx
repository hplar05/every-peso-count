'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { createBudgetEntry } from '../actions'
import { toast } from 'sonner'

const budgetEntrySchema = z.object({
  project_id: z.string().min(1, "Please select a project"),
  source: z.string().min(2, "Source is required"),
  amount_allocated: z.coerce.number().min(0, "Amount cannot be negative"),
  amount_spent: z.coerce.number().min(0, "Amount cannot be negative"),
  purpose: z.string().optional(),
  date: z.string().min(1, "Date is required"),
}).refine(data => data.amount_allocated > 0 || data.amount_spent > 0, {
  message: "Either allocated or spent amount must be greater than 0",
  path: ["amount_spent"]
})

type BudgetEntryFormValues = z.infer<typeof budgetEntrySchema>

export default function NewBudgetEntryPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetEntryFormValues>({
    resolver: zodResolver(budgetEntrySchema),
    defaultValues: {
      amount_allocated: 0,
      amount_spent: 0,
      date: new Date().toISOString().split('T')[0]
    }
  })

  useEffect(() => {
    async function fetchProjects() {
      const supabase = createClient()
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (data) setProjects(data)
    }
    fetchProjects()
  }, [])

  const onSubmit = async (data: BudgetEntryFormValues) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const res = await createBudgetEntry(data)
      if (res.error) {
        setServerError(res.error)
        toast.error(res.error)
      } else {
        toast.success('Budget entry created successfully.')
        router.push('/admin/budget')
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/budget" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2563EB] mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Add Ledger Entry</h2>
        <p className="text-gray-600">Log an incoming allocation or an outgoing expenditure.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Project *</label>
            <select
              {...register('project_id')}
              className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
            >
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.project_id && <p className="text-red-600 text-xs mt-1">{errors.project_id.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Date *</label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
              />
              {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Source / Vendor *</label>
              <input
                type="text"
                placeholder="e.g. Mayor's Office, Hardware Store"
                {...register('source')}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
              />
              {errors.source && <p className="text-red-600 text-xs mt-1">{errors.source.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 border border-gray-200 rounded-sm">
            <div>
              <label className="block text-sm font-medium text-[#1E3A5F] mb-1.5">Funds In (Allocated)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('amount_allocated')}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 text-sm font-medium text-green-700"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave as 0 if this is an expense.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E3A5F] mb-1.5">Funds Out (Spent)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('amount_spent')}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-sm font-medium text-red-600"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave as 0 if this is an allocation.</p>
              {errors.amount_spent && <p className="text-red-600 text-xs mt-1">{errors.amount_spent.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Purpose (Optional)</label>
            <textarea
              rows={2}
              placeholder="Provide details about what this transaction was for."
              {...register('purpose')}
              className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
            />
          </div>

          {serverError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
              {serverError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link 
              href="/admin/budget"
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Ledger Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

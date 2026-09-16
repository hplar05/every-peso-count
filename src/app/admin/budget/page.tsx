import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { BudgetCharts } from './budget-charts'
import { BudgetLedger } from './budget-ledger'

export default async function BudgetPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login/admin')

  const { data: currentUser } = await supabase
    .from('officials')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.status !== 'approved' || (currentUser.role !== 'admin' && currentUser.role !== 'secretary')) {
    redirect('/admin')
  }

  // Fetch all projects for high-level budget aggregations
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, budget_allocated, budget_utilized')
    .order('created_at', { ascending: false })

  // Fetch recent budget entries
  const { data: entries } = await supabase
    .from('budget_entries')
    .select(`
      *,
      projects ( name )
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate totals
  let totalAllocated = 0
  let totalSpent = 0

  if (projects) {
    projects.forEach(p => {
      totalAllocated += Number(p.budget_allocated) || 0
      totalSpent += Number(p.budget_utilized) || 0
    })
  }

  const remainingBalance = totalAllocated - totalSpent

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Budget Dashboard</h2>
          <p className="text-gray-600">Track and manage barangay financial allocations and expenditures.</p>
        </div>
        <Link 
          href="/admin/budget/new" 
          className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Ledger Entry
        </Link>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Allocated Funds</div>
          <div className="text-3xl font-medium text-[#172033]">{formatCurrency(totalAllocated)}</div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Funds Utilized</div>
          <div className="text-3xl font-medium text-[#2563EB]">{formatCurrency(totalSpent)}</div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Remaining Balance</div>
          <div className={`text-3xl font-medium ${remainingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(remainingBalance)}
          </div>
        </div>
      </div>

      {/* Charts */}
      {projects && projects.length > 0 ? (
        <BudgetCharts projects={projects} />
      ) : (
        <div className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm text-center text-gray-500 mb-8">
          No project budget data available to chart.
        </div>
      )}

      {/* Ledger Table */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-[#1E3A5F] mb-4">Recent Ledger Entries</h3>
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <BudgetLedger entries={entries || []} />
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Wallet, Home, Flag, Info, Users } from 'lucide-react'
import { BudgetCharts } from '../admin/budget/budget-charts'

export const metadata = {
  title: "Budget Transparency",
  description: "View how Barangay Bella Luz allocates and spends public funds.",
}

// Revalidate every 60 seconds (ISR) so the page stays fresh without blocking every request
export const revalidate = 60

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

export default async function PublicBudgetPage() {
  const supabase = await createClient()

  // Fetch all projects for high-level budget aggregations
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, budget_allocated, budget_utilized')
    .order('created_at', { ascending: false })

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
            <Link href="/kagawads" className="hidden md:flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Users size={16} /> Kagawads
            </Link>
            <Link href="/projects" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Flag size={16} /> Projects
            </Link>
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Home size={16} /> Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#2563EB] mb-2">
            <Wallet size={24} />
            <h1 className="text-3xl font-medium text-[#1E3A5F] tracking-tight">Barangay Budget Overview</h1>
          </div>
          <p className="text-gray-600 max-w-2xl text-lg">
            Complete transparency into the barangay's financial health. Track total allocated funds and monitor expenditures across all active projects.
          </p>
        </div>

        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm flex flex-col justify-center">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Allocated Funds</div>
            <div className="text-3xl font-medium text-[#172033]">{formatCurrency(totalAllocated)}</div>
            <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Info size={12} /> Total budget received across all projects
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm flex flex-col justify-center">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Funds Utilized</div>
            <div className="text-3xl font-medium text-[#2563EB]">{formatCurrency(totalSpent)}</div>
            <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Info size={12} /> Total amount spent on project executions
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm flex flex-col justify-center">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Remaining Balance</div>
            <div className={`text-3xl font-medium ${remainingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(remainingBalance)}
            </div>
            <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Info size={12} /> Funds available for future utilization
            </div>
          </div>
        </div>

        {/* Charts */}
        {projects && projects.length > 0 ? (
          <BudgetCharts projects={projects} />
        ) : (
          <div className="bg-white border border-gray-200 p-8 rounded-sm shadow-sm text-center text-gray-500 mb-8">
            No budget data available to visualize.
          </div>
        )}
      </main>
    </div>
  )
}

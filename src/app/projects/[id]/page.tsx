import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, ArrowLeft, Calendar, Flag, Wallet, Target, Activity } from 'lucide-react'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default async function PublicProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  const supabase = await createClient()

  // Fetch project details
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Fetch milestones
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', id)
    .order('target_date', { ascending: true })

  // Fetch budget ledger entries
  const { data: budgetEntries } = await supabase
    .from('budget_entries')
    .select('*')
    .eq('project_id', id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const totalMilestones = milestones ? milestones.length : 0
  const completedMilestones = milestones ? milestones.filter(m => m.status === 'completed').length : 0
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
  const displayProgress = project.status === 'completed' ? 100 : progressPercentage

  const budgetUtilizedPercentage = project.budget_allocated > 0 
    ? Math.round((project.budget_utilized / project.budget_allocated) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1E3A5F] text-white py-4 px-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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
            <Link href="/budget" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Wallet size={16} /> Budget Overview
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
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:py-8">
        <div className="mb-6">
          <Link href="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2563EB] mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Project List
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-medium text-[#1E3A5F] tracking-tight">{project.name}</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Details Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-4 flex items-center gap-2">
                <Activity size={20} className="text-[#2563EB]" />
                Project Description
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {project.description || <span className="text-gray-400 italic">No description provided for this project.</span>}
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-[#1E3A5F] flex items-center gap-2">
                  <Target size={20} className="text-[#2563EB]" />
                  Project Milestones
                </h2>
                <div className="text-sm font-medium text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full">
                  {displayProgress}% Complete
                </div>
              </div>
              
              {(!milestones || milestones.length === 0) ? (
                <div className="text-center p-8 border border-dashed border-gray-200 rounded-sm text-gray-500">
                  No milestones have been set for this project yet.
                </div>
              ) : (
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative pl-6">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'ongoing' ? 'bg-[#2563EB]' :
                        'bg-gray-300'
                      }`} />
                      
                      <div className="bg-gray-50 border border-gray-100 p-4 rounded-sm hover:border-gray-200 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-[#172033]">{milestone.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${getStatusColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                        {milestone.target_date && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar size={14} /> Target: {new Date(milestone.target_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-6 flex items-center gap-2">
                <Wallet size={20} className="text-[#2563EB]" />
                Budget Ledger
              </h2>
              
              {(!budgetEntries || budgetEntries.length === 0) ? (
                <div className="text-center p-8 border border-dashed border-gray-200 rounded-sm text-gray-500">
                  No financial transactions have been logged for this project yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F5F7FA] border-b border-gray-200 text-[#1E3A5F]">
                      <tr>
                        <th className="px-4 py-2 font-medium">Date</th>
                        <th className="px-4 py-2 font-medium">Source / Purpose</th>
                        <th className="px-4 py-2 font-medium text-right">In</th>
                        <th className="px-4 py-2 font-medium text-right">Out</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {budgetEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-[#172033]">{entry.source}</div>
                            {entry.purpose && <div className="text-xs text-gray-500 mt-0.5">{entry.purpose}</div>}
                          </td>
                          <td className="px-4 py-3 text-right text-green-700 font-medium whitespace-nowrap">
                            {Number(entry.amount_allocated) > 0 ? `+${formatCurrency(entry.amount_allocated)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right text-red-600 font-medium whitespace-nowrap">
                            {Number(entry.amount_spent) > 0 ? `-${formatCurrency(entry.amount_spent)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-[#2563EB]" />
                Timeline
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Start Date</div>
                  <div className="font-medium text-[#172033]">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Target Completion</div>
                  <div className="font-medium text-[#172033]">
                    {project.target_date ? new Date(project.target_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-4 flex items-center gap-2">
                <Wallet size={20} className="text-[#2563EB]" />
                Budget Summary
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm text-gray-500">Allocated Budget</span>
                    <span className="font-medium text-[#172033]">{formatCurrency(project.budget_allocated)}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm text-gray-500">Budget Utilized</span>
                    <span className="font-medium text-[#2563EB]">{formatCurrency(project.budget_utilized)}</span>
                  </div>
                  
                  {/* Utilization Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        budgetUtilizedPercentage > 100 ? 'bg-red-500' :
                        budgetUtilizedPercentage === 100 ? 'bg-green-500' :
                        'bg-[#2563EB]'
                      }`}
                      style={{ width: `${Math.min(budgetUtilizedPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right mt-1 text-xs text-gray-500">
                    {budgetUtilizedPercentage}% utilized
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-gray-500 font-medium">Remaining Balance</span>
                    <span className={`font-semibold ${project.budget_allocated - project.budget_utilized < 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {formatCurrency(project.budget_allocated - project.budget_utilized)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

        </div>
      </main>
    </div>
  )
}

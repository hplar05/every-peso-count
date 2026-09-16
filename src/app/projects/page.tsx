import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { FolderKanban, ArrowRight, Home, Wallet, Users } from 'lucide-react'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning': return 'bg-gray-100 text-gray-800'
    case 'ongoing': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'on_hold': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default async function PublicProjectsPage() {
  const supabase = await createClient()

  // Fetch projects and their milestones in one go or separately
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      milestones (
        id,
        status
      )
    `)
    .order('created_at', { ascending: false })

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
            <Link href="/budget" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Wallet size={16} /> Budget Overview
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
            <FolderKanban size={24} />
            <h1 className="text-3xl font-medium text-[#1E3A5F] tracking-tight">Barangay Projects</h1>
          </div>
          <p className="text-gray-600 max-w-2xl text-lg">
            Track the progress of infrastructure, community, and development projects in Barangay Bella Luz. 
            View project statuses, timelines, and allocated budgets to ensure complete transparency.
          </p>
        </div>

        {(!projects || projects.length === 0) ? (
          <div className="bg-white border border-gray-200 p-12 text-center rounded-sm shadow-sm">
            <FolderKanban size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#1E3A5F]">No projects found</h3>
            <p className="text-gray-500 mt-1">There are currently no projects listed in the transparency portal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              // Calculate progress based on milestones
              const totalMilestones = project.milestones ? project.milestones.length : 0
              const completedMilestones = project.milestones ? project.milestones.filter((m: any) => m.status === 'completed').length : 0
              const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
              
              // If there are no milestones, but project is completed, set to 100%
              const displayProgress = project.status === 'completed' ? 100 : progressPercentage

              return (
                <Link 
                  key={project.id} 
                  href={`/projects/${project.id}`}
                  className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:shadow-md hover:border-[#2563EB] transition-all group flex flex-col h-full"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      {project.target_date && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
                          Target: {new Date(project.target_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-medium text-[#1E3A5F] mb-2 group-hover:text-[#2563EB] transition-colors line-clamp-2">
                      {project.name}
                    </h2>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="px-5 pb-5 mt-auto">
                    <div className="space-y-3">
                      {/* Budget row */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Allocated Budget:</span>
                        <span className="font-medium text-[#172033]">{formatCurrency(project.budget_allocated)}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[#1E3A5F]">Milestone Progress</span>
                          <span className="font-medium text-[#1E3A5F]">{displayProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              displayProgress === 100 ? 'bg-green-600' : 'bg-[#2563EB]'
                            }`}
                            style={{ width: `${displayProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-[#2563EB] text-sm font-medium">
                      <span>View Project Details</span>
                      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

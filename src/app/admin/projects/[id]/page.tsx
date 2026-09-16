import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProjectManager } from './project-manager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch project
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

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <Link href="/admin/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2563EB] mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </Link>
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">{project.name}</h2>
        <p className="text-gray-600">Manage project details and milestones.</p>
      </div>

      <ProjectManager project={project} initialMilestones={milestones || []} />
    </div>
  )
}

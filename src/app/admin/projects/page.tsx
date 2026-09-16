import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Eye, Edit } from 'lucide-react'
import { ProjectList } from './project-list'

export const metadata = {
  title: "Projects",
  description: "Manage barangay infrastructure and community projects.",
}

export default async function ProjectsPage() {
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

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Projects</h2>
          <p className="text-gray-600">Manage all barangay projects and initiatives.</p>
        </div>
        <Link 
          href="/admin/projects/new" 
          className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New Project
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        {(!projects || projects.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            No projects found. Click "New Project" to create one.
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </div>
    </div>
  )
}

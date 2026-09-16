'use client'

import Link from 'next/link'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { deleteProject } from './actions'
import { useRouter } from 'next/navigation'

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

export function ProjectList({ projects }: { projects: any[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project? This will also delete all its milestones and budget entries.')) {
      await deleteProject(id)
      router.refresh()
    }
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-[#F5F7FA] border-b border-gray-200 text-[#1E3A5F]">
        <tr>
          <th className="px-6 py-3 font-medium">Project Name</th>
          <th className="px-6 py-3 font-medium">Status</th>
          <th className="px-6 py-3 font-medium">Target Date</th>
          <th className="px-6 py-3 font-medium">Budget Allocated</th>
          <th className="px-6 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {projects.map((project) => (
          <tr key={project.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="font-medium text-[#172033]">{project.name}</div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
            </td>
            <td className="px-6 py-4 text-gray-500">
              {project.target_date ? new Date(project.target_date).toLocaleDateString() : '-'}
            </td>
            <td className="px-6 py-4 text-gray-500">
              {formatCurrency(project.budget_allocated)}
            </td>
            <td className="px-6 py-4 text-right space-x-3">
              <Link 
                href={`/projects/${project.id}`} 
                className="inline-flex items-center text-gray-500 hover:text-[#2563EB] transition-colors"
                title="View Public Page"
                target="_blank"
              >
                <Eye size={16} />
              </Link>
              <Link 
                href={`/admin/projects/${project.id}`} 
                className="inline-flex items-center text-gray-500 hover:text-[#2563EB] transition-colors"
                title="Edit Project"
              >
                <Edit size={16} />
              </Link>
              <button 
                onClick={() => handleDelete(project.id)}
                className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors"
                title="Delete Project"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

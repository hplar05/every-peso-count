'use client'

import Link from 'next/link'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { deleteSession } from './actions'
import { useRouter } from 'next/navigation'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-yellow-100 text-yellow-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function SessionList({ sessions }: { sessions: any[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this session? All attendance records will be permanently removed.')) {
      await deleteSession(id)
      router.refresh()
    }
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-[#F5F7FA] border-b border-gray-200 text-[#1E3A5F]">
        <tr>
          <th className="px-6 py-3 font-medium">Date</th>
          <th className="px-6 py-3 font-medium">Title / Type</th>
          <th className="px-6 py-3 font-medium">Status</th>
          <th className="px-6 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {sessions.map((session) => (
          <tr key={session.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="font-medium text-[#172033]">
                {new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="font-medium text-[#172033]">{session.title || 'Untitled Session'}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{session.type}</div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${getStatusColor(session.status)}`}>
                {session.status}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-3">
              <Link 
                href={`/admin/attendance/${session.id}`} 
                className="inline-flex items-center text-gray-500 hover:text-[#2563EB] transition-colors"
                title="Manage Attendance"
              >
                <Edit size={16} />
              </Link>
              <button 
                onClick={() => handleDelete(session.id)}
                className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors"
                title="Delete Session"
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

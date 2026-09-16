'use client'

import { deleteBudgetEntry } from './actions'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

export function BudgetLedger({ entries }: { entries: any[] }) {
  const router = useRouter()

  const handleDelete = async (id: string, projectId: string) => {
    if (confirm('Are you sure you want to delete this ledger entry? This will adjust the project totals.')) {
      await deleteBudgetEntry(id, projectId)
      router.refresh()
    }
  }

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white">
        No ledger entries found.
      </div>
    )
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-[#F5F7FA] border-b border-gray-200 text-[#1E3A5F]">
        <tr>
          <th className="px-6 py-3 font-medium">Date</th>
          <th className="px-6 py-3 font-medium">Project</th>
          <th className="px-6 py-3 font-medium">Source / Purpose</th>
          <th className="px-6 py-3 font-medium text-right">Allocated (In)</th>
          <th className="px-6 py-3 font-medium text-right">Spent (Out)</th>
          <th className="px-6 py-3 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {entries.map((entry) => (
          <tr key={entry.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
              {new Date(entry.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 font-medium text-[#172033]">
              {entry.projects?.name || 'Unknown Project'}
            </td>
            <td className="px-6 py-4">
              <div className="font-medium text-[#1E3A5F]">{entry.source}</div>
              {entry.purpose && <div className="text-xs text-gray-500 mt-1">{entry.purpose}</div>}
            </td>
            <td className="px-6 py-4 text-right text-green-700 font-medium">
              {Number(entry.amount_allocated) > 0 ? `+${formatCurrency(entry.amount_allocated)}` : '-'}
            </td>
            <td className="px-6 py-4 text-right text-red-600 font-medium">
              {Number(entry.amount_spent) > 0 ? `-${formatCurrency(entry.amount_spent)}` : '-'}
            </td>
            <td className="px-6 py-4 text-right">
              <button 
                onClick={() => handleDelete(entry.id, entry.project_id)}
                className="inline-flex items-center text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Entry"
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

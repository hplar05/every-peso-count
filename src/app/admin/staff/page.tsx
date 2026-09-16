import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { deactivateAccount } from '../actions'
import { ShieldAlert } from 'lucide-react'

export default async function StaffAccountsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login/admin')

  const { data: currentUser } = await supabase
    .from('officials')
    .select('role')
    .eq('id', user.id)
    .single()

  // Only admins can manage staff accounts
  if (!currentUser || currentUser.role !== 'admin') {
    redirect('/admin')
  }

  const { data: staff } = await supabase
    .from('officials')
    .select('*')
    .in('status', ['approved', 'rejected'])
    .order('role', { ascending: true })
    .order('name', { ascending: true })

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Staff Accounts</h2>
          <p className="text-gray-600">Manage all registered administrators, secretaries, and kagawads.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        {(!staff || staff.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            No staff accounts found.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7FA] border-b border-gray-200 text-[#1E3A5F]">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Position</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((official) => (
                <tr key={official.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[#172033]">{official.name}</td>
                  <td className="px-6 py-4 capitalize">{official.role}</td>
                  <td className="px-6 py-4 text-gray-500">{official.position || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      official.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {official.status.charAt(0).toUpperCase() + official.status.slice(1)}
                    </span>
                    {official.status === 'rejected' && official.rejection_reason && (
                      <div className="text-xs text-gray-500 mt-1">Reason: {official.rejection_reason}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {official.role !== 'admin' && official.status === 'approved' && (
                      <form action={async () => {
                        'use server'
                        await deactivateAccount(official.id)
                      }}>
                        <button 
                          type="submit"
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <ShieldAlert size={14} /> Deactivate
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

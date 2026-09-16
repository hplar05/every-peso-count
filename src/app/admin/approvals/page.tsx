import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { approveAccount, rejectAccount } from '../actions'
import { Check, X } from 'lucide-react'

export const metadata = {
  title: "Pending Approvals",
  description: "Review and approve new staff account registrations.",
}

export default async function ApprovalsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login/admin')

  const { data: currentUser } = await supabase
    .from('officials')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role === 'kagawad') {
    redirect('/admin')
  }

  const roleFilter = currentUser.role === 'admin' 
    ? ['secretary', 'kagawad'] 
    : ['kagawad']

  const { data: pendingOfficials } = await supabase
    .from('officials')
    .select('*')
    .eq('status', 'pending')
    .in('role', roleFilter)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Pending Approvals</h2>
        <p className="text-gray-600">Review and approve new staff and official accounts.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        {(!pendingOfficials || pendingOfficials.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            No pending approvals at this time.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7FA] border-b border-gray-200 text-[#1E3A5F]">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Position</th>
                <th className="px-6 py-3 font-medium">Date Registered</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingOfficials.map((official) => (
                <tr key={official.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[#172033]">{official.name}</td>
                  <td className="px-6 py-4 capitalize">{official.role}</td>
                  <td className="px-6 py-4 text-gray-500">{official.position || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(official.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <form action={async () => {
                      'use server'
                      await approveAccount(official.id)
                    }}>
                      <button 
                        type="submit"
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#2E7D32] text-white rounded-sm hover:bg-green-800 transition-colors"
                      >
                        <Check size={14} /> Approve
                      </button>
                    </form>

                    <form action={async (formData: FormData) => {
                      'use server'
                      const reason = formData.get('reason') as string
                      await rejectAccount(official.id, reason || 'Rejected by administrator')
                    }} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        name="reason" 
                        placeholder="Rejection reason..." 
                        required
                        className="px-2 py-1.5 border border-gray-300 rounded-sm text-xs w-32 focus:outline-none focus:border-red-500"
                      />
                      <button 
                        type="submit"
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors"
                      >
                        <X size={14} /> Reject
                      </button>
                    </form>
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

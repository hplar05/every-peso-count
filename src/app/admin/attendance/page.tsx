import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Eye, Edit, CalendarDays } from 'lucide-react'
import { SessionList } from './session-list'

export default async function SessionsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('officials')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.status !== 'approved' || (currentUser.role !== 'admin' && currentUser.role !== 'secretary')) {
    redirect('/admin')
  }

  // Fetch all sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      attendance (id)
    `)
    .order('session_date', { ascending: false })

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Sangguniang Barangay Sessions</h2>
          <p className="text-gray-600">Manage official meetings, agendas, and track attendance.</p>
        </div>
        <Link 
          href="/admin/attendance/new" 
          className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Schedule Session
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        {(!sessions || sessions.length === 0) ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <CalendarDays size={40} className="text-gray-300 mb-4" />
            <div className="text-lg font-medium text-[#1E3A5F] mb-1">No sessions scheduled</div>
            <div>Click "Schedule Session" to create the first one.</div>
          </div>
        ) : (
          <SessionList sessions={sessions} />
        )}
      </div>
    </div>
  )
}

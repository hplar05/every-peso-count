import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AttendanceManager } from './attendance-manager'

export default async function SessionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login/admin')

  // Fetch session details
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (!session) notFound()

  // Fetch all approved Kagawads (council_members)
  const { data: kagawads } = await supabase
    .from('officials')
    .select('*')
    .eq('role', 'council_member')
    .eq('status', 'approved')
    .order('name', { ascending: true })

  // Fetch existing attendance records for this session
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('session_id', id)

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/attendance" className="inline-flex items-center text-sm text-gray-500 hover:text-[#2563EB] mb-4">
          <ArrowLeft size={16} className="mr-1" /> Back to Sessions
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
            session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
            session.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {session.status}
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            {session.type} Session
          </span>
        </div>
        <h2 className="text-3xl font-medium text-[#1E3A5F] tracking-tight">{session.title || 'Untitled Session'}</h2>
        <p className="text-gray-600 mt-1">
          Date: {new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <AttendanceManager 
        session={session} 
        kagawads={kagawads || []} 
        initialAttendance={attendanceRecords || []} 
      />
    </div>
  )
}

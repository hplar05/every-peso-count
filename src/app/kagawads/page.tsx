import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Home, Users, Flag, Wallet, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export const metadata = {
  title: "Kagawad Officials",
  description: "Meet the Sangguniang Barangay members of Barangay Bella Luz.",
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function PublicKagawadsPage() {
  const supabase = await createClient()

  // Fetch approved Kagawads
  const { data: kagawads } = await supabase
    .from('officials')
    .select('*')
    .eq('role', 'council_member')
    .eq('status', 'approved')
    .order('name', { ascending: true })

  // Fetch past sessions and their attendance
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id,
      title,
      session_date,
      type,
      status,
      attendance (
        official_id,
        status
      )
    `)
    .eq('status', 'completed')
    .order('session_date', { ascending: false })

  // Calculate attendance scorecards for each Kagawad
  const totalCompletedSessions = sessions?.length || 0
  
  const scorecards: Record<string, { present: number, absent: number, excused: number }> = {}
  
  kagawads?.forEach(k => {
    scorecards[k.id] = { present: 0, absent: 0, excused: 0 }
  })

  sessions?.forEach(session => {
    session.attendance.forEach((record: any) => {
      if (scorecards[record.official_id]) {
        if (record.status === 'present') scorecards[record.official_id].present++
        if (record.status === 'absent') scorecards[record.official_id].absent++
        if (record.status === 'excused') scorecards[record.official_id].excused++
      }
    })
  })

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
            <Link href="/projects" className="hidden md:flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Flag size={16} /> Projects
            </Link>
            <Link href="/budget" className="hidden md:flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <Wallet size={16} /> Budget
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
            <Users size={24} />
            <h1 className="text-3xl font-medium text-[#1E3A5F] tracking-tight">Sangguniang Barangay Members</h1>
          </div>
          <p className="text-gray-600 max-w-2xl text-lg">
            View the official roster of Barangay Kagawads and their attendance records for all completed barangay sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Scorecard Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-medium text-[#1E3A5F]">Attendance Scorecards</h2>
            
            {(!kagawads || kagawads.length === 0) ? (
              <div className="bg-white border border-gray-200 p-8 rounded-sm text-center text-gray-500">
                No approved Kagawads found in the system.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kagawads.map(kagawad => {
                  const scores = scorecards[kagawad.id]
                  const attendanceRate = totalCompletedSessions > 0 
                    ? Math.round((scores.present / totalCompletedSessions) * 100) 
                    : 0

                  return (
                    <div key={kagawad.id} className="bg-white border border-gray-200 p-5 rounded-sm shadow-sm hover:border-[#2563EB] transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-lg text-[#172033]">{kagawad.name}</h3>
                          <div className="text-sm text-gray-500 capitalize">{kagawad.position || 'Barangay Kagawad'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold text-[#1E3A5F]">{attendanceRate}%</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Attendance</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center text-green-600 mb-1"><CheckCircle2 size={16} /></div>
                          <div className="text-lg font-medium text-[#172033]">{scores.present}</div>
                          <div className="text-xs text-gray-500">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-red-600 mb-1"><XCircle size={16} /></div>
                          <div className="text-lg font-medium text-[#172033]">{scores.absent}</div>
                          <div className="text-xs text-gray-500">Absent</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center text-yellow-600 mb-1"><AlertCircle size={16} /></div>
                          <div className="text-lg font-medium text-[#172033]">{scores.excused}</div>
                          <div className="text-xs text-gray-500">Excused</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Past Sessions */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-[#1E3A5F]">Completed Sessions</h2>
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
              {(!sessions || sessions.length === 0) ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No completed sessions yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {sessions.map(session => (
                    <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm text-[#172033] line-clamp-1">{session.title || 'Untitled Session'}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-800">
                          {session.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

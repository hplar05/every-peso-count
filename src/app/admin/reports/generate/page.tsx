import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { PrintWrapper } from './print-wrapper'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

export default async function GenerateReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  
  const fromDate = resolvedParams.from as string
  const toDate = resolvedParams.to as string
  const includeProjects = resolvedParams.projects === 'true'
  const includeBudget = resolvedParams.budget === 'true'
  const includeAttendance = resolvedParams.attendance === 'true'

  const supabase = await createClient()

  // Verify auth
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

  // Fetch Data Based on params
  let projects: any[] = []
  let budgetStats = { allocated: 0, spent: 0, remaining: 0 }
  let kagawads: any[] = []
  let sessions: any[] = []
  let totalCompletedSessions = 0

  // Apply date filters where applicable
  const dateFilter = (query: any, dateColumn: string) => {
    if (fromDate) query = query.gte(dateColumn, fromDate)
    if (toDate) query = query.lte(dateColumn, toDate)
    return query
  }

  if (includeProjects || includeBudget) {
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
    query = dateFilter(query, 'created_at')
    const { data: pData } = await query
    
    if (pData) {
      projects = pData
      pData.forEach(p => {
        budgetStats.allocated += Number(p.budget_allocated) || 0
        budgetStats.spent += Number(p.budget_utilized) || 0
      })
      budgetStats.remaining = budgetStats.allocated - budgetStats.spent
    }
  }

  if (includeAttendance) {
    // Fetch Kagawads
    const { data: kData } = await supabase
      .from('officials')
      .select('id, name')
      .eq('role', 'council_member')
      .eq('status', 'approved')
      .order('name', { ascending: true })
    if (kData) kagawads = kData

    // Fetch sessions in date range
    let sQuery = supabase.from('sessions').select(`
      id, title, session_date, attendance(official_id, status)
    `).eq('status', 'completed')
    sQuery = dateFilter(sQuery, 'session_date')
    const { data: sData } = await sQuery
    
    if (sData) {
      sessions = sData
      totalCompletedSessions = sData.length
    }
  }

  const generatedDate = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  let subtitle = 'Complete Historical Report'
  if (fromDate && toDate) subtitle = `Report Period: ${fromDate} to ${toDate}`
  else if (fromDate) subtitle = `Report Period: From ${fromDate}`
  else if (toDate) subtitle = `Report Period: Up to ${toDate}`

  return (
    <div className="bg-white min-h-screen text-black font-sans p-8 max-w-[800px] mx-auto">
      <PrintWrapper />
      
      {/* Report Header */}
      <div className="flex items-center gap-4 border-b-2 border-[#1E3A5F] pb-6 mb-8">
        <div className="w-16 h-16 rounded-full border-2 border-[#1E3A5F] overflow-hidden flex items-center justify-center flex-shrink-0">
          <Image src="/logo.jpg" alt="Logo" width={64} height={64} className="object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E3A5F] uppercase">Barangay Bella Luz</h1>
          <h2 className="text-lg font-semibold text-gray-800">Transparency & Accountability Report</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
          <p className="text-xs text-gray-500 mt-1">Generated on: {generatedDate}</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Module: Budget */}
        {includeBudget && (
          <section>
            <h3 className="text-lg font-bold text-[#1E3A5F] border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider">
              Financial Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 text-center">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Allocated</div>
                <div className="text-xl font-bold text-[#172033]">{formatCurrency(budgetStats.allocated)}</div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 text-center">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Utilized</div>
                <div className="text-xl font-bold text-blue-700">{formatCurrency(budgetStats.spent)}</div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 text-center">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Remaining Balance</div>
                <div className={`text-xl font-bold ${budgetStats.remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {formatCurrency(budgetStats.remaining)}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Module: Projects */}
        {includeProjects && (
          <section>
            <h3 className="text-lg font-bold text-[#1E3A5F] border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider">
              Project Status
            </h3>
            {projects.length === 0 ? (
              <p className="text-sm text-gray-500">No projects found in this period.</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-3 py-2">Project Name</th>
                    <th className="border border-gray-200 px-3 py-2">Status</th>
                    <th className="border border-gray-200 px-3 py-2 text-right">Allocated</th>
                    <th className="border border-gray-200 px-3 py-2 text-right">Utilized</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td className="border border-gray-200 px-3 py-2 font-medium">{p.name}</td>
                      <td className="border border-gray-200 px-3 py-2 capitalize">{p.status.replace('_', ' ')}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(p.budget_allocated)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">{formatCurrency(p.budget_utilized)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* Module: Attendance */}
        {includeAttendance && (
          <section>
            <h3 className="text-lg font-bold text-[#1E3A5F] border-b border-gray-300 pb-2 mb-4 uppercase tracking-wider">
              Kagawad Attendance Scorecard
            </h3>
            <p className="text-sm text-gray-600 mb-4">Based on {totalCompletedSessions} completed sessions.</p>
            
            {kagawads.length === 0 ? (
              <p className="text-sm text-gray-500">No Kagawads found.</p>
            ) : (
              <table className="w-full text-left text-sm border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-3 py-2">Council Member Name</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Present</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Absent</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Excused</th>
                    <th className="border border-gray-200 px-3 py-2 text-center">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {kagawads.map(k => {
                    let present = 0, absent = 0, excused = 0
                    sessions.forEach(s => {
                      const att = s.attendance.find((a: any) => a.official_id === k.id)
                      if (att?.status === 'present') present++
                      if (att?.status === 'absent') absent++
                      if (att?.status === 'excused') excused++
                    })
                    const rate = totalCompletedSessions > 0 ? Math.round((present / totalCompletedSessions) * 100) : 0

                    return (
                      <tr key={k.id}>
                        <td className="border border-gray-200 px-3 py-2 font-medium">{k.name}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">{present}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">{absent}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center">{excused}</td>
                        <td className="border border-gray-200 px-3 py-2 text-center font-bold">{rate}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-300 flex justify-between items-end">
        <div className="text-sm text-gray-500">
          <p>Official record generated from the Every Peso Counts system.</p>
        </div>
        <div className="text-center w-48">
          <div className="border-b border-gray-400 h-8 mb-2"></div>
          <div className="text-xs font-medium uppercase tracking-wider text-[#1E3A5F]">Certified True and Correct</div>
        </div>
      </div>
    </div>
  )
}

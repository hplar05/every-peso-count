import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsCharts } from "./analytics-charts"

export const metadata = {
  title: "Analytics",
  description: "Barangay Bella Luz data analytics and statistics.",
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login/admin")

  const { data: me } = await supabase.from("officials").select("role, status").eq("id", user.id).single()
  if (!me || me.role !== "admin" || me.status !== "approved") redirect("/admin")

  const [
    { data: budgetData },
    { data: projectData },
    { data: feedbackData },
    { data: officials },
    { data: attendanceData },
  ] = await Promise.all([
    supabase.from("budget_entries").select("amount_allocated, amount_spent"),
    supabase.from("projects").select("status"),
    supabase.from("feedback").select("status, created_at"),
    supabase.from("officials").select("id, name, role").eq("status", "approved"),
    supabase.from("attendance").select("official_id, status"),
  ])

  // Budget totals
  const totalAllocated = (budgetData || []).reduce((s: number, r: any) => s + (r.amount_allocated || 0), 0)
  const totalSpent = (budgetData || []).reduce((s: number, r: any) => s + (r.amount_spent || 0), 0)
  const totalRemaining = totalAllocated - totalSpent

  // Projects by status
  const projectCounts = {
    planning: 0, ongoing: 0, completed: 0, on_hold: 0,
  }
  ;(projectData || []).forEach((p: any) => {
    if (p.status in projectCounts) projectCounts[p.status as keyof typeof projectCounts]++
  })

  // Feedback counts
  const feedbackTotal = (feedbackData || []).length
  const feedbackResolved = (feedbackData || []).filter((f: any) => f.status === "resolved").length
  const feedbackPending = (feedbackData || []).filter((f: any) => f.status === "pending").length
  const feedbackInReview = feedbackTotal - feedbackResolved - feedbackPending

  // Attendance rate per official
  const attendanceMap: Record<string, { present: number; total: number }> = {}
  ;(attendanceData || []).forEach((a: any) => {
    if (!attendanceMap[a.official_id]) attendanceMap[a.official_id] = { present: 0, total: 0 }
    attendanceMap[a.official_id].total++
    if (a.status === "present") attendanceMap[a.official_id].present++
  })

  const officialAttendance = (officials || [])
    .map((o: any) => ({
      name: o.name.split(" ").slice(-1)[0], // last name for brevity
      rate: attendanceMap[o.id]
        ? Math.round((attendanceMap[o.id].present / attendanceMap[o.id].total) * 100)
        : 0,
      sessions: attendanceMap[o.id]?.total || 0,
    }))
    .filter((o: any) => o.sessions > 0)
    .sort((a: any, b: any) => b.rate - a.rate)
    .slice(0, 8)

  const stats = {
    budget: { totalAllocated, totalSpent, totalRemaining },
    projects: projectCounts,
    feedback: { total: feedbackTotal, resolved: feedbackResolved, pending: feedbackPending, inReview: feedbackInReview },
    attendance: officialAttendance,
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Summary of portal data and performance indicators.</p>
      </div>
      <AnalyticsCharts stats={stats} />
    </div>
  )
}
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FolderKanban, MessageSquare, CalendarDays, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Dashboard",
  description: "Barangay Bella Luz admin dashboard overview.",
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login/admin")

  const { data: me } = await supabase.from("officials").select("role").eq("id", user.id).single()
  if (me?.role === "kagawad") redirect("/admin/feedback")

  const [
    { count: activeProjects },
    { count: pendingFeedback },
    { data: nextSession }
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "ongoing"),
    supabase.from("feedback").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("sessions").select("title, session_date").eq("status", "scheduled").order("session_date", { ascending: true }).limit(1).maybeSingle()
  ])

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight mb-2">Welcome to the Command Center</h2>
      <p className="text-gray-600 mb-8">
        Manage barangay projects, budget allocations, and citizen feedback from this unified dashboard.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/projects" className="bg-white border border-gray-200 p-6 rounded-sm hover:border-[#2563EB] transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#F5F7FA] rounded-sm flex items-center justify-center text-[#2563EB] group-hover:bg-blue-50 transition-colors">
              <FolderKanban size={18} />
            </div>
            <h3 className="font-medium text-[#172033]">Active Projects</h3>
          </div>
          <p className="text-3xl font-medium text-[#2563EB]">{activeProjects ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Currently ongoing</p>
        </Link>

        <Link href="/admin/feedback" className="bg-white border border-gray-200 p-6 rounded-sm hover:border-[#2563EB] transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#F5F7FA] rounded-sm flex items-center justify-center text-[#2563EB] group-hover:bg-blue-50 transition-colors">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-medium text-[#172033]">Pending Feedback</h3>
          </div>
          <p className="text-3xl font-medium text-[#2563EB]">{pendingFeedback ?? 0}</p>
          {(pendingFeedback ?? 0) > 0 && (
            <p className="text-xs text-[#2563EB] mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> Requires attention
            </p>
          )}
          {(pendingFeedback ?? 0) === 0 && (
            <p className="text-xs text-gray-400 mt-1">All caught up</p>
          )}
        </Link>

        <Link href="/admin/attendance" className="bg-white border border-gray-200 p-6 rounded-sm hover:border-[#2563EB] transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#F5F7FA] rounded-sm flex items-center justify-center text-[#2563EB] group-hover:bg-blue-50 transition-colors">
              <CalendarDays size={18} />
            </div>
            <h3 className="font-medium text-[#172033]">Next Session</h3>
          </div>
          {nextSession ? (
            <>
              <p className="text-base font-medium text-[#2563EB] line-clamp-1">{nextSession.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(nextSession.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </>
          ) : (
            <p className="text-base font-medium text-gray-400">Not Scheduled</p>
          )}
        </Link>
      </div>
    </div>
  )
}
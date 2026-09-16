import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Activity Log",
  description: "View all administrative actions and audit trail.",
}

const ACTION_MAP: Record<string, { letter: string; color: string }> = {
  approved: { letter: "A", color: "#2E7D32" },
  rejected: { letter: "R", color: "#DC2626" },
  deactivated: { letter: "D", color: "#DC2626" },
  project: { letter: "P", color: "#2563EB" },
  milestone: { letter: "M", color: "#7C3AED" },
  budget: { letter: "B", color: "#D97706" },
  feedback: { letter: "F", color: "#0891B2" },
  notification: { letter: "N", color: "#059669" },
  attendance: { letter: "T", color: "#0369A1" },
  default: { letter: "L", color: "#6B7280" },
}

function getStyle(action: string) {
  const lower = action.toLowerCase()
  for (const [key, val] of Object.entries(ACTION_MAP)) {
    if (lower.includes(key)) return val
  }
  return ACTION_MAP.default
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}

export default async function ActivityLogPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login/admin")

  const { data: me } = await supabase
    .from("officials")
    .select("role, status")
    .eq("id", user.id)
    .single()

  if (!me || me.role !== "admin" || me.status !== "approved") {
    redirect("/admin")
  }

  const { data: logs } = await supabase
    .from("activity_log")
    .select("id, action, target_table, created_at, officials!activity_log_official_id_fkey(name, role)")
    .order("created_at", { ascending: false })
    .limit(200)

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Activity Log</h2>
        <p className="text-gray-500 text-sm mt-1">
          A record of all administrative actions taken on the portal.
          {logs && logs.length > 0 && (
            <span className="ml-2 text-gray-400">{logs.length} entries</span>
          )}
        </p>
      </div>

      {(!logs || logs.length === 0) ? (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No activity recorded yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Actions like approving accounts, creating projects, and sending notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {logs.map((log: any) => {
              const style = getStyle(log.action)
              const official = log.officials
              return (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[#F5F7FA] transition-colors">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: style.color }}
                  >
                    {style.letter}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#172033]">{log.action}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {official ? (
                        <span className="text-xs text-gray-500">
                          by <span className="font-medium text-gray-700">{official.name}</span>
                          <span className="ml-1 text-gray-400 capitalize">({official.role})</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">by system</span>
                      )}
                      {log.target_table && (
                        <>
                          <span className="text-gray-300 mx-1">{"·"}</span>
                          <span className="text-xs text-gray-400 capitalize">
                            {log.target_table.replace(/_/g, " ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{relativeTime(log.created_at)}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(log.created_at).toLocaleTimeString("en-PH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
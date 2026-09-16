import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const ACTION_ICONS: Record<string, { icon: string; color: string }> = {
  default: { icon: "A", color: "#6B7280" },
  "Approved account": { icon: "A", color: "#2E7D32" },
  "Rejected account": { icon: "R", color: "#DC2626" },
  "Deactivated": { icon: "D", color: "#DC2626" },
  "Created project": { icon: "P", color: "#2563EB" },
  "Updated project": { icon: "P", color: "#2563EB" },
  "Deleted project": { icon: "P", color: "#DC2626" },
  "Created milestone": { icon: "M", color: "#7C3AED" },
  "Updated milestone": { icon: "M", color: "#7C3AED" },
  "Created budget entry": { icon: "B", color: "#D97706" },
  "Updated budget entry": { icon: "B", color: "#D97706" },
  "Responded to feedback": { icon: "F", color: "#0891B2" },
  "Sent notification": { icon: "N", color: "#059669" },
}

function getActionStyle(action: string) {
  for (const key of Object.keys(ACTION_ICONS)) {
    if (action.toLowerCase().includes(key.toLowerCase())) {
      return ACTION_ICONS[key]
    }
  }
  return ACTION_ICONS.default
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}

export default async function ActivityLogPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login/admin")

  const { data: currentUser } = await supabase
    .from("officials")
    .select("role, status")
    .eq("id", user.id)
    .single()

  if (!currentUser || currentUser.role !== "admin" || currentUser.status !== "approved") {
    redirect("/admin")
  }

  const { data: logs } = await supabase
    .from("activity_log")
    .select(`
      id,
      action,
      target_table,
      target_id,
      created_at,
      officials!activity_log_official_id_fkey (
        name,
        role
      )
    `)
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
          <p className="text-gray-400 text-xs mt-1">Actions like approving accounts, creating projects, and sending notifications will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {logs.map((log: any, index: number) => {
              const style = getActionStyle(log.action)
              const official = log.officials
              return (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[#F5F7FA] transition-colors">
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: style.color }}
                  >
                    {style.icon}
                  </div>

                  {/* Content */}
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
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400 capitalize">{log.target_table.replace(/_/g, " ")}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatRelativeTime(log.created_at)}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(log.created_at).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
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

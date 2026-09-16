import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Wallet, 
  CalendarCheck, 
  MessageSquare, 
  FileBarChart, 
  Users, 
  ClipboardCheck,
  LogOut,
  Activity,
  Bell
} from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/admin')
  }

  // Fetch official profile
  const { data: official } = await supabase
    .from('officials')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!official) {
    await supabase.auth.signOut()
    redirect('/login/admin')
  }

  if (official.status === 'pending') {
    redirect('/pending')
  }

  if (official.status === 'rejected') {
    redirect('/rejected')
  }

  const role = official.role

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1E3A5F] text-white flex flex-col md:min-h-screen flex-shrink-0">
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
            <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="object-cover" />
          </div>
          <div>
            <div className="font-medium tracking-tight leading-tight">Command Center</div>
            <div className="text-xs text-[#F4B942]">Every Peso Counts</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Main Links - Accessible based on role */}
          {(role === 'admin' || role === 'secretary') && (
            <>
              <SidebarLink href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <SidebarLink href="/admin/projects" icon={<FolderKanban size={18} />} label="Projects" />
              <SidebarLink href="/admin/budget" icon={<Wallet size={18} />} label="Budget" />
              <SidebarLink href="/admin/attendance" icon={<CalendarCheck size={18} />} label="Attendance" />
              <SidebarLink href="/admin/reports" icon={<FileBarChart size={18} />} label="Reports" />
            </>
          )}

          {/* Feedback & Notifications - Everyone has access */}
          <SidebarLink href="/admin/feedback" icon={<MessageSquare size={18} />} label="Feedback" />
          <SidebarLink href="/admin/notifications" icon={<Bell size={18} />} label="Announcements" />

          {/* Admin & Secretary Management Links */}
          {(role === 'admin' || role === 'secretary') && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <div className="px-3 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                Management
              </div>
              <SidebarLink 
                href="/admin/approvals" 
                icon={<ClipboardCheck size={18} />} 
                label="Pending Approvals" 
              />
              {role === 'admin' && (
                <>
                  <SidebarLink 
                    href="/admin/staff" 
                    icon={<Users size={18} />} 
                    label="Staff Accounts" 
                  />
                  <SidebarLink 
                    href="/admin/activity" 
                    icon={<Activity size={18} />} 
                    label="Activity Log" 
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-sm font-bold">
              {official.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate">{official.name}</div>
              <div className="text-xs text-gray-300 capitalize truncate">{official.role}</div>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 text-white text-sm rounded-sm transition-colors">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 lg:px-8 shadow-sm">
          <h1 className="text-xl font-medium text-[#172033] tracking-tight">Barangay Bella Luz Portal</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

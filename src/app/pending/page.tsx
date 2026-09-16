import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

export const metadata = {
  title: "Pending Approval",
  description: "Your account is awaiting administrator review.",
}

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let officialName = 'there'
  let roleName = 'official'

  if (user) {
    const { data: official } = await supabase
      .from('officials')
      .select('name, role')
      .eq('id', user.id)
      .single()

    if (official) {
      officialName = official.name.split(' ')[0]
      roleName = official.role === 'kagawad' ? 'Kagawad' : 'Secretary'
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 mb-4">
              <Image src="/logo.jpg" alt="Barangay Bella Luz Logo" width={64} height={64} className="object-cover" />
            </div>
            <div className="border-l-4 border-[#F4B942] pl-4 self-start w-full">
              <h1 className="text-xl font-medium text-[#172033] tracking-tight">Pending Approval</h1>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Hello <strong>{officialName}</strong>, your <strong>{roleName}</strong> account has been registered and is now waiting for an administrator to review it.
          </p>

          <div className="bg-[#F5F7FA] border border-gray-200 rounded-sm p-4 mb-6 space-y-2">
            <p className="text-xs font-medium text-[#1E3A5F] uppercase tracking-wider">What happens next</p>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex gap-2"><span className="text-[#F4B942] font-bold mt-0.5">1.</span>An admin will review your registration.</li>
              <li className="flex gap-2"><span className="text-[#F4B942] font-bold mt-0.5">2.</span>You will receive an email when a decision is made.</li>
              <li className="flex gap-2"><span className="text-[#F4B942] font-bold mt-0.5">3.</span>If approved, you can log in and access your dashboard.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm text-gray-500 hover:text-[#172033] transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

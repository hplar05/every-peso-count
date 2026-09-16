import Link from 'next/link'
import Image from 'next/image'

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">


      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 mb-4">
              <Image src="/logo.jpg" alt="Barangay Bella Luz Logo" width={64} height={64} className="object-cover" />
            </div>
            <div className="border-l-4 border-[#F4B942] pl-4 self-start">
              <h1 className="text-xl font-medium text-[#172033] tracking-tight">Pending Approval</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Your secretary account has been registered and is currently pending review. You will be able to access the dashboard once an administrator approves your account.
          </p>
          <div className="pt-4 border-t border-gray-100">
            <Link href="/login" className="text-sm font-medium text-[#172033] hover:text-[#2563EB] transition-colors">
              &larr; Return to login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

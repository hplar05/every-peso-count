import { Shield, UserCheck, Eye, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: "Every Peso Counts - Barangay Bella Luz",
  description: "Barangay Bella Luz public transparency portal. Track projects, view budget allocations, and submit feedback to your local government.",
}


export default function Home() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-[#1E3A5F]/10 bg-[#1E3A5F] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
            <Image src="/logo.jpg" alt="Barangay Bella Luz Logo" width={40} height={40} className="object-cover" />
          </div>
          <span className="font-medium text-lg tracking-tight">Barangay Bella Luz</span>
        </div>
        <div className="text-sm text-gray-300" suppressHydrationWarning>
          Last updated on {currentDate}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto space-y-8 w-full">
          
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 mb-2">
              <Image src="/logo.jpg" alt="Barangay Bella Luz Seal" width={128} height={128} className="object-cover" />
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-[#1E3A5F]">
              Welcome to <br className="md:hidden" />
              Barangay Bella Luz
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              Every peso counts. View how your barangay's funds and projects are managed through our transparency portal.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 w-full pt-8">
            <Link 
              href="/login/admin" 
              className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col hover:border-[#2563EB] hover:shadow-sm transition-all group text-left"
            >
              <div className="w-10 h-10 bg-[#F5F7FA] border border-gray-100 rounded-sm flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors text-[#1E3A5F]">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-1">Admin Portal</h2>
              <p className="text-gray-500 text-sm">Access the administrative dashboard</p>
            </Link>

            <Link 
              href="/login/secretary" 
              className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col hover:border-[#2563EB] hover:shadow-sm transition-all group text-left"
            >
              <div className="w-10 h-10 bg-[#F5F7FA] border border-gray-100 rounded-sm flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors text-[#1E3A5F]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-1">Secretary Portal</h2>
              <p className="text-gray-500 text-sm">Access the secretary portal</p>
            </Link>

            <Link 
              href="/login/kagawad" 
              className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col hover:border-[#2563EB] hover:shadow-sm transition-all group text-left"
            >
              <div className="w-10 h-10 bg-[#F5F7FA] border border-gray-100 rounded-sm flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors text-[#1E3A5F]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-1">Kagawad Portal</h2>
              <p className="text-gray-500 text-sm">Access the kagawad portal</p>
            </Link>

            <Link 
              href="/projects" 
              className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col hover:border-[#2563EB] hover:shadow-sm transition-all group text-left"
            >
              <div className="w-10 h-10 bg-[#F5F7FA] border border-gray-100 rounded-sm flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors text-[#1E3A5F]">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-1">Resident View</h2>
              <p className="text-gray-500 text-sm">View transparency reports and projects</p>
            </Link>

            <Link 
              href="/feedback" 
              className="bg-white border border-gray-200 rounded-sm p-6 flex flex-col hover:border-[#2563EB] hover:shadow-sm transition-all group text-left"
            >
              <div className="w-10 h-10 bg-[#F5F7FA] border border-gray-100 rounded-sm flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors text-[#1E3A5F]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-medium text-[#1E3A5F] mb-1">Feedback</h2>
              <p className="text-gray-500 text-sm">Submit concerns and see resolutions</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

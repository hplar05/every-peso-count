'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '../actions'
import { use } from 'react'

const initialState = { error: null as string | null }

export default function LoginPage({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = use(params)
  const role = resolvedParams.role.toLowerCase()
  
  // Format the title based on the role
  const getRoleTitle = () => {
    switch (role) {
      case 'admin':
        return 'Admin Portal Login'
      case 'secretary':
        return 'Secretary Portal Login'
      case 'kagawad':
        return 'Kagawad Portal Login'
      default:
        return 'Barangay Official Login'
    }
  }

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await login(formData)
  }, initialState)
  
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                <Image src="/logo.jpg" alt="Barangay Bella Luz Logo" width={64} height={64} className="object-cover" />
              </div>
              <h1 className="text-xl font-medium text-[#172033] tracking-tight text-center">{getRoleTitle()}</h1>
              <p className="text-sm text-gray-500 mt-1 text-center">Sign in to access your portal</p>
            </div>

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder={`${role === 'admin' ? 'admin' : role}@example.com`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </button>
            
            {role !== 'admin' && (
              <div className="text-center mt-4">
                <Link href="/register" className="text-sm text-[#2563EB] hover:underline">
                  Don't have an account? Register
                </Link>
              </div>
            )}
            
            {role === 'admin' && (
              <div className="text-center mt-4">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                  &larr; Return home
                </Link>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}

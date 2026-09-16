'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { register } from './actions'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('secretary')
  const [position, setPosition] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.set('name', name)
    formData.set('email', email)
    formData.set('password', password)
    formData.set('role', role)
    formData.set('position', position)

    startTransition(async () => {
      try {
        const res = await register(formData)
        if (res?.error) {
          setError(res.error)
          toast.error(res.error)
        } else {
          toast.success('Account registered. Awaiting admin approval.')
        }
      } catch {
        const msg = 'An unexpected error occurred. Please try again.'
        setError(msg)
        toast.error(msg)
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md bg-white border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 mb-4">
              <Image src="/logo.jpg" alt="Barangay Bella Luz Logo" width={64} height={64} className="object-cover" />
            </div>
            <h1 className="text-xl font-medium text-[#172033] tracking-tight text-center">Staff Registration</h1>
            <p className="text-sm text-gray-500 mt-1 text-center">Create your official portal account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="Juan Dela Cruz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="juan@example.com"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
              >
                <option value="secretary">Secretary</option>
                <option value="kagawad">Kagawad (Council Member)</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="position">
                Position Title (Optional)
              </label>
              <input
                id="position"
                name="position"
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                placeholder="e.g. Committee on Health"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              {isPending ? 'Registering...' : 'Register Account'}
            </button>

            <div className="text-center mt-4">
              <Link href="/" className="text-sm text-[#2563EB] hover:underline">
                Already have an account? Sign in to your portal
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}


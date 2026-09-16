'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSession, saveAttendance } from '../actions'
import { CheckCircle2, XCircle, AlertCircle, Save } from 'lucide-react'
import { toast } from 'sonner'

export function AttendanceManager({ session, kagawads, initialAttendance }: { session: any, kagawads: any[], initialAttendance: any[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'attendance' | 'details'>('attendance')
  
  // Initialize attendance state mapping official_id -> status
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>(() => {
    const state: Record<string, string> = {}
    initialAttendance.forEach(record => {
      state[record.official_id] = record.status
    })
    return state
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{type: 'success'|'error', text: string} | null>(null)

  const handleStatusChange = (officialId: string, status: string) => {
    setAttendanceState(prev => ({ ...prev, [officialId]: status }))
  }

  const handleSaveAttendance = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    const recordsToSave = Object.entries(attendanceState).map(([official_id, status]) => ({
      official_id,
      status
    }))

    const res = await saveAttendance(session.id, recordsToSave)
    if (res.error) {
      setSaveMessage({ type: 'error', text: res.error })
      toast.error(res.error)
    } else {
      setSaveMessage({ type: 'success', text: 'Attendance records saved successfully.' })
      toast.success('Attendance saved.')
      router.refresh()
    }
    setIsSaving(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'attendance' 
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Attendance Marking
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'details' 
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Session Details
        </button>
      </div>

      <div className="p-0">
        {activeTab === 'attendance' && (
          <div>
            {kagawads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No approved Kagawads found in the system.
              </div>
            ) : (
              <div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F5F7FA] border-b border-gray-200 text-[#1E3A5F]">
                    <tr>
                      <th className="px-6 py-3 font-medium">Council Member (Kagawad)</th>
                      <th className="px-6 py-3 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {kagawads.map(official => {
                      const currentStatus = attendanceState[official.id]
                      return (
                        <tr key={official.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-[#172033]">
                            {official.name}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleStatusChange(official.id, 'present')}
                                className={`flex flex-col items-center justify-center w-24 py-1.5 rounded-sm border transition-all ${
                                  currentStatus === 'present' 
                                    ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                <CheckCircle2 size={18} className="mb-1" />
                                <span className="text-xs font-medium">Present</span>
                              </button>
                              
                              <button
                                onClick={() => handleStatusChange(official.id, 'absent')}
                                className={`flex flex-col items-center justify-center w-24 py-1.5 rounded-sm border transition-all ${
                                  currentStatus === 'absent' 
                                    ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                <XCircle size={18} className="mb-1" />
                                <span className="text-xs font-medium">Absent</span>
                              </button>
                              
                              <button
                                onClick={() => handleStatusChange(official.id, 'excused')}
                                className={`flex flex-col items-center justify-center w-24 py-1.5 rounded-sm border transition-all ${
                                  currentStatus === 'excused' 
                                    ? 'bg-yellow-50 border-yellow-500 text-yellow-700 ring-1 ring-yellow-500' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                <AlertCircle size={18} className="mb-1" />
                                <span className="text-xs font-medium">Excused</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    {saveMessage && (
                      <div className={`text-sm font-medium ${saveMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                        {saveMessage.text}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="p-6">
            <form action={async (formData) => {
              const res = await updateSession(session.id, formData)
              if (res.success) {
                setSaveMessage({ type: 'success', text: 'Session details updated.' })
                router.refresh()
              }
            }} className="space-y-6 max-w-2xl">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5">Session Title</label>
                  <input name="title" type="text" required defaultValue={session.title} className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#172033] mb-1.5">Date</label>
                    <input name="session_date" type="date" required defaultValue={session.session_date} className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#172033] mb-1.5">Type</label>
                    <select name="type" required defaultValue={session.type} className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm text-sm">
                      <option value="regular">Regular Session</option>
                      <option value="special">Special Session</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5">Agenda</label>
                  <textarea name="agenda" required rows={5} defaultValue={session.agenda} className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5">Status</label>
                  <select name="status" required defaultValue={session.status} className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm text-sm">
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700">
                  Save Details
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

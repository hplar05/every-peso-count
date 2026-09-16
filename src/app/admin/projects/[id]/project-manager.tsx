'use client'

import { useActionState, useState } from 'react'
import { updateProject, createMilestone, updateMilestone, deleteMilestone } from '../actions'
import { Trash2, Edit, Check, X, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

export function ProjectManager({ project, initialMilestones }: { project: any, initialMilestones: any[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'details' | 'milestones'>('details')
  
  // Project Edit State
  const [projectState, projectAction, isProjectPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await updateProject(project.id, formData)
  }, { error: '', success: undefined } as { error: string; success?: undefined } | { success: boolean; error?: undefined })

  // Milestone Add State
  const [milestoneState, milestoneAction, isMilestonePending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await createMilestone(project.id, formData)
    if (res.success) {
      setIsAddingMilestone(false)
      router.refresh()
    }
    return res
  }, { error: '', success: undefined } as { error: string; success?: undefined } | { success: boolean; error?: undefined })

  const [isAddingMilestone, setIsAddingMilestone] = useState(false)
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null)

  const handleUpdateMilestone = async (id: string, formData: FormData) => {
    await updateMilestone(id, project.id, formData)
    setEditingMilestoneId(null)
    router.refresh()
  }

  const handleDeleteMilestone = async (id: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      await deleteMilestone(id, project.id)
      router.refresh()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'details' 
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Project Details
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'milestones' 
              ? 'border-b-2 border-[#2563EB] text-[#2563EB]' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Milestones ({initialMilestones.length})
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'details' && (
          <form action={projectAction} className="space-y-6 max-w-3xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="name">
                  Project Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={project.name}
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={project.description || ''}
                  className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="status">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue={project.status}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="budget_allocated">
                    Allocated Budget (PHP) *
                  </label>
                  <input
                    id="budget_allocated"
                    name="budget_allocated"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={project.budget_allocated}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Utilized: {formatCurrency(project.budget_utilized)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="start_date">
                    Start Date
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={project.start_date || ''}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5" htmlFor="target_date">
                    Target Completion Date
                  </label>
                  <input
                    id="target_date"
                    name="target_date"
                    type="date"
                    defaultValue={project.target_date || ''}
                    className="w-full px-3 py-2 bg-[#F5F7FA] border border-gray-300 rounded-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-sm"
                  />
                </div>
              </div>
            </div>

            {projectState?.error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm">
                {projectState.error}
              </div>
            )}
            
            {projectState?.success && (
              <div className="p-3 bg-green-50 border-l-4 border-green-600 text-green-800 text-sm">
                Project details updated successfully.
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isProjectPending}
                className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
              >
                {isProjectPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-[#1E3A5F]">Project Milestones</h3>
              {!isAddingMilestone && (
                <button
                  onClick={() => setIsAddingMilestone(true)}
                  className="inline-flex items-center gap-1 bg-[#F5F7FA] text-[#1E3A5F] border border-gray-200 px-3 py-1.5 rounded-sm text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  <Plus size={14} /> Add Milestone
                </button>
              )}
            </div>

            {isAddingMilestone && (
              <form action={milestoneAction} className="bg-gray-50 p-4 border border-gray-200 rounded-sm space-y-4">
                <h4 className="text-sm font-medium text-[#172033]">New Milestone</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-[#172033] mb-1" htmlFor="m_title">Title *</label>
                    <input id="m_title" name="title" type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-sm text-sm" placeholder="e.g. Phase 1 Completion" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#172033] mb-1" htmlFor="m_status">Status</label>
                    <select id="m_status" name="status" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-sm text-sm">
                      <option value="planning">Planning</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#172033] mb-1" htmlFor="m_target_date">Target Date</label>
                    <input id="m_target_date" name="target_date" type="date" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-sm text-sm" />
                  </div>
                </div>
                
                {milestoneState?.error && <div className="text-red-600 text-xs">{milestoneState.error}</div>}

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsAddingMilestone(false)} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={isMilestonePending} className="px-3 py-1.5 bg-[#2563EB] text-white text-sm rounded-sm hover:bg-blue-700 disabled:bg-gray-300">Save</button>
                </div>
              </form>
            )}

            {initialMilestones.length === 0 && !isAddingMilestone ? (
              <div className="text-center p-8 border border-dashed border-gray-300 rounded-sm text-gray-500">
                No milestones added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {initialMilestones.map(milestone => (
                  <div key={milestone.id} className="border border-gray-200 rounded-sm p-4 hover:border-gray-300 transition-colors">
                    {editingMilestoneId === milestone.id ? (
                      <form action={(formData) => handleUpdateMilestone(milestone.id, formData)} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-3">
                            <input name="title" type="text" required defaultValue={milestone.title} className="w-full px-2 py-1 bg-white border border-gray-300 rounded-sm text-sm" />
                          </div>
                          <div>
                            <select name="status" defaultValue={milestone.status} className="w-full px-2 py-1 bg-white border border-gray-300 rounded-sm text-sm">
                              <option value="planning">Planning</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                              <option value="on_hold">On Hold</option>
                            </select>
                          </div>
                          <div>
                            <input name="target_date" type="date" defaultValue={milestone.target_date || ''} className="w-full px-2 py-1 bg-white border border-gray-300 rounded-sm text-sm" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingMilestoneId(null)} className="p-1.5 text-gray-500 hover:text-gray-700"><X size={16} /></button>
                          <button type="submit" className="p-1.5 text-green-600 hover:text-green-800"><Check size={16} /></button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-[#172033]">{milestone.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                              milestone.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Target: {milestone.target_date ? new Date(milestone.target_date).toLocaleDateString() : 'Not set'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingMilestoneId(milestone.id)} className="text-gray-400 hover:text-[#2563EB]"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteMilestone(milestone.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

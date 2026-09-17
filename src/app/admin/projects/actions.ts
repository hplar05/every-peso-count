'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/resend'

async function logActivity(supabase: any, action: string, targetTable: string, targetId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('activity_log').insert({
      official_id: user.id,
      action,
      target_table: targetTable,
      target_id: targetId
    })
  }
}

export async function createProject(formData: FormData) {
  try {
    const supabase = await createClient()

    // Auth guard
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
    
    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const status = formData.get('status') as string || 'planning'
    const start_date = formData.get('start_date') as string || null
    const target_date = formData.get('target_date') as string || null
    const budget_allocated = parseFloat(formData.get('budget_allocated') as string || '0')

    // Input validation
    if (!name || name.length < 3) return { error: 'Project name must be at least 3 characters.' }
    if (isNaN(budget_allocated) || budget_allocated < 0) return { error: 'Budget must be a positive number.' }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        status,
        start_date,
        target_date,
        budget_allocated,
        budget_utilized: 0
      })
      .select('id')
      .single()

    if (error) return { error: error.message }
    
    await logActivity(supabase, 'Created project', 'projects', data.id)

    revalidatePath('/admin/projects')
    revalidatePath('/projects')
    return { success: true, id: data.id }
  } catch (error: any) {
    console.error('Error creating project:', error)
    return { error: 'An unexpected error occurred while creating the project.' }
  }
}

export async function updateProject(id: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // Auth guard
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
    if (!id) return { error: 'Project ID is required' }
    
    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const status = formData.get('status') as string
    const start_date = formData.get('start_date') as string || null
    const target_date = formData.get('target_date') as string || null
    const budget_allocated = parseFloat(formData.get('budget_allocated') as string || '0')

    if (!name || name.length < 3) return { error: 'Project name must be at least 3 characters.' }
    if (isNaN(budget_allocated) || budget_allocated < 0) return { error: 'Budget must be a positive number.' }

    const { error } = await supabase
      .from('projects')
      .update({
        name,
        description,
        status,
        start_date,
        target_date,
        budget_allocated
      })
      .eq('id', id)

    if (error) return { error: error.message }
    
    await logActivity(supabase, 'Updated project', 'projects', id)

    // Send Notification (fire-and-forget — don't block response)
    sendEmail({
      to: ['brgy.bellaluz@example.com'],
      subject: `Project Updated: ${name}`,
      text: `Project Update\n\nThe project ${name} has been updated.\nStatus: ${status}\nBudget Allocated: ₱${budget_allocated.toLocaleString()}`
    }).catch(err => console.error('[sendEmail] Failed to notify on project update:', err))

    revalidatePath('/admin/projects')
    revalidatePath(`/admin/projects/${id}`)
    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating project:', error)
    return { error: 'An unexpected error occurred while updating the project.' }
  }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Deleted project', 'projects', id)

  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  return { success: true }
}

export async function createMilestone(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const target_date = formData.get('target_date') as string || null
  const status = formData.get('status') as string || 'planning'

  const { data, error } = await supabase
    .from('milestones')
    .insert({
      project_id: projectId,
      title,
      target_date,
      status
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Created milestone', 'milestones', data.id)

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function updateMilestone(id: string, projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const target_date = formData.get('target_date') as string || null
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('milestones')
    .update({
      title,
      target_date,
      status
    })
    .eq('id', id)

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Updated milestone', 'milestones', id)

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function deleteMilestone(id: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Deleted milestone', 'milestones', id)

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

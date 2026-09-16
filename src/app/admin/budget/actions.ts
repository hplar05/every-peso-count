'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

// Function to sync project totals based on ledger entries
async function syncProjectBudget(supabase: any, projectId: string) {
  // Sum up all spent amounts for this project
  const { data: entries, error } = await supabase
    .from('budget_entries')
    .select('amount_spent, amount_allocated')
    .eq('project_id', projectId)

  if (error || !entries) return

  let totalSpent = 0
  let totalAllocatedFromEntries = 0 // Optional: if we want to sync allocation too, but we'll focus on spent

  entries.forEach((entry: any) => {
    totalSpent += parseFloat(entry.amount_spent || '0')
    totalAllocatedFromEntries += parseFloat(entry.amount_allocated || '0')
  })

  // We update only the budget_utilized to keep it in sync with actual ledger spending.
  // We leave the project's budget_allocated alone, as that might be the theoretical total grant.
  await supabase
    .from('projects')
    .update({ budget_utilized: totalSpent })
    .eq('id', projectId)
}

export async function createBudgetEntry(data: {
  project_id: string
  source: string
  amount_allocated: number
  amount_spent: number
  purpose?: string
  date: string
}) {
  const supabase = await createClient()

  const { data: entry, error } = await supabase
    .from('budget_entries')
    .insert({
      project_id: data.project_id,
      source: data.source,
      amount_allocated: data.amount_allocated,
      amount_spent: data.amount_spent,
      purpose: data.purpose || null,
      date: data.date
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Created budget entry', 'budget_entries', entry.id)
  await syncProjectBudget(supabase, data.project_id)

  revalidatePath('/admin/budget')
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${data.project_id}`)
  revalidatePath('/projects')
  revalidatePath(`/projects/${data.project_id}`)
  return { success: true, id: entry.id }
}

export async function deleteBudgetEntry(id: string, projectId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('budget_entries')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Deleted budget entry', 'budget_entries', id)
  await syncProjectBudget(supabase, projectId)

  revalidatePath('/admin/budget')
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

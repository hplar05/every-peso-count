'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveAccount(id: string) {
  const supabase = await createClient()
  
  // Update status
  const { error } = await supabase
    .from('officials')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', id)

  if (error) return { error: error.message }
  
  // Log activity
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('activity_log').insert({
      official_id: user.id,
      action: 'Approved account',
      target_table: 'officials',
      target_id: id
    })
  }

  revalidatePath('/admin/approvals')
  revalidatePath('/admin/staff')
  return { success: true }
}

export async function rejectAccount(id: string, reason: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('officials')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', id)

  if (error) return { error: error.message }
  
  // Log activity
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('activity_log').insert({
      official_id: user.id,
      action: 'Rejected account',
      target_table: 'officials',
      target_id: id
    })
  }

  revalidatePath('/admin/approvals')
  revalidatePath('/admin/staff')
  return { success: true }
}

export async function deactivateAccount(id: string) {
  return rejectAccount(id, "Deactivated by administrator")
}

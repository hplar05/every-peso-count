'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/resend'

async function getOfficialEmail(officialId: string): Promise<string | null> {
  try {
    const service = createServiceClient()
    const { data, error } = await service.auth.admin.getUserById(officialId)
    if (error || !data?.user) return null
    return data.user.email ?? null
  } catch {
    return null
  }
}

export async function approveAccount(id: string) {
  const supabase = await createClient()

  const { data: official, error: fetchError } = await supabase
    .from('officials')
    .select('name, role')
    .eq('id', id)
    .single()

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

  // Send approval email
  const email = await getOfficialEmail(id)
  if (email && official) {
    const roleLabel = official.role === 'kagawad' ? 'Kagawad' : 'Secretary'
    await sendEmail({
      to: email,
      subject: 'Your account has been approved - Every Peso Counts',
      text: [
        `Hello ${official.name},`,
        '',
        `Your ${roleLabel} account for the Barangay Bella Luz transparency portal has been approved.`,
        '',
        'You can now sign in and access your portal dashboard at:',
        `https://everypesocount.online/login/${official.role}`,
        '',
        'If you did not request this account, please contact the barangay administration.',
        '',
        'Barangay Bella Luz - Every Peso Counts Transparency Portal',
        'everypesocount.online',
      ].join('\n'),
    })
  }

  revalidatePath('/admin/approvals')
  revalidatePath('/admin/staff')
  return { success: true }
}

export async function rejectAccount(id: string, reason: string) {
  const supabase = await createClient()

  const { data: official } = await supabase
    .from('officials')
    .select('name, role')
    .eq('id', id)
    .single()

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

  // Send rejection email
  const email = await getOfficialEmail(id)
  if (email && official) {
    const roleLabel = official.role === 'kagawad' ? 'Kagawad' : 'Secretary'
    await sendEmail({
      to: email,
      subject: 'Account registration update - Every Peso Counts',
      text: [
        `Hello ${official.name},`,
        '',
        `Your ${roleLabel} registration for the Barangay Bella Luz portal has not been approved at this time.`,
        '',
        `Reason: ${reason}`,
        '',
        'If you believe this is an error, please contact the barangay administration directly.',
        '',
        'Barangay Bella Luz - Every Peso Counts Transparency Portal',
        'everypesocount.online',
      ].join('\n'),
    })
  }

  revalidatePath('/admin/approvals')
  revalidatePath('/admin/staff')
  return { success: true }
}

export async function deactivateAccount(id: string) {
  return rejectAccount(id, 'Deactivated by administrator')
}

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
      subject: 'Your account has been approved — Every Peso Counts',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #172033;">
          <div style="background: #1E3A5F; padding: 24px 32px; border-radius: 4px 4px 0 0;">
            <p style="color: #F4B942; font-size: 13px; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">Every Peso Counts</p>
            <h1 style="color: #fff; font-size: 20px; margin: 8px 0 0; font-weight: 600;">Account Approved</h1>
          </div>
          <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 32px; border-radius: 0 0 4px 4px;">
            <p style="margin: 0 0 16px;">Hello <strong>${official.name}</strong>,</p>
            <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
              Your <strong>${roleLabel}</strong> account for the Barangay Bella Luz transparency portal has been <span style="color: #2E7D32; font-weight: 600;">approved</span>.
            </p>
            <p style="margin: 0 0 24px; color: #4b5563; line-height: 1.6;">You can now log in and access your portal dashboard.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://every-peso-count.vercel.app'}/login/${official.role}"
               style="display: inline-block; background: #2563EB; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 500;">
              Sign In to Portal
            </a>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">Barangay Bella Luz, San Mateo — Every Peso Counts Transparency Portal</p>
          </div>
        </div>
      `
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
      subject: 'Account registration update — Every Peso Counts',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #172033;">
          <div style="background: #1E3A5F; padding: 24px 32px; border-radius: 4px 4px 0 0;">
            <p style="color: #F4B942; font-size: 13px; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">Every Peso Counts</p>
            <h1 style="color: #fff; font-size: 20px; margin: 8px 0 0; font-weight: 600;">Registration Not Approved</h1>
          </div>
          <div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 32px; border-radius: 0 0 4px 4px;">
            <p style="margin: 0 0 16px;">Hello <strong>${official.name}</strong>,</p>
            <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">
              Your <strong>${roleLabel}</strong> registration for the Barangay Bella Luz portal has not been approved at this time.
            </p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 2px; margin: 0 0 24px;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
            </div>
            <p style="margin: 0 0 24px; color: #4b5563; line-height: 1.6;">If you believe this is an error, please contact the barangay administration directly.</p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">Barangay Bella Luz, San Mateo — Every Peso Counts Transparency Portal</p>
          </div>
        </div>
      `
    })
  }

  revalidatePath('/admin/approvals')
  revalidatePath('/admin/staff')
  return { success: true }
}

export async function deactivateAccount(id: string) {
  return rejectAccount(id, 'Deactivated by administrator')
}

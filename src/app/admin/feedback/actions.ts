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

export async function updateFeedback(id: string, formData: FormData) {
  const status = formData.get('status') as string
  const response = formData.get('response') as string
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get existing feedback to check if we need to email
  const { data: existingFeedback } = await supabase
    .from('feedback')
    .select('email, tracking_code')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('feedback')
    .update({
      status,
      response: response || null,
      handled_by: user.id
    })
    .eq('id', id)

  if (error) return { error: error.message }
  
  await logActivity(supabase, `Updated feedback status to ${status}`, 'feedback', id)

  // Send Email if resolved and email exists
  if (status === 'resolved' && existingFeedback?.email) {
    await sendEmail({
      to: [existingFeedback.email],
      subject: `Barangay Bella Luz: Your Inquiry (${existingFeedback.tracking_code}) has been resolved`,
      html: `
        <div style="font-family: sans-serif; max-w-md; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #1E3A5F; margin-top: 0;">Inquiry Resolved</h2>
          <p style="color: #444; line-height: 1.5;">Hello,</p>
          <p style="color: #444; line-height: 1.5;">Your recent inquiry with tracking code <strong>${existingFeedback.tracking_code}</strong> has been resolved by our officials.</p>
          
          <div style="background-color: #F5F7FA; padding: 15px; border-radius: 4px; border: 1px solid #eee; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1E3A5F;">Official Response:</p>
            <p style="margin: 10px 0 0 0; color: #333; line-height: 1.5; white-space: pre-wrap;">${response}</p>
          </div>
          
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This is an automated notification from the Every Peso Counts Transparency Portal.</p>
        </div>
      `
    })
  }

  revalidatePath('/admin/feedback')
  revalidatePath(`/admin/feedback/${id}`)
  revalidatePath('/feedback')
  return { success: true }
}

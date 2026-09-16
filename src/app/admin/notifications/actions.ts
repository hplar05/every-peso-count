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

export async function sendNotification(formData: FormData) {
  const supabase = await createClient()
  
  const type = formData.get('type') as string
  const message = formData.get('message') as string
  const recipient_scope = formData.get('recipient_scope') as string

  // Insert into DB
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      type,
      message,
      recipient_scope
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  
  await logActivity(supabase, `Sent notification (${recipient_scope})`, 'notifications', data.id)

  // Send Emails
  if (recipient_scope === 'officials' || recipient_scope === 'all') {
    // Fetch all officials with email (actually we don't store email in officials table)
    // In a real app we would join with auth.users using admin api, or we just send a mock broadcast
    const emailRes = await sendEmail({
      to: ['brgy.bellaluz@example.com'], // Mock recipient since officials emails aren't stored
      subject: `Barangay Bella Luz Update: ${type}`,
      html: `
        <div style="font-family: sans-serif; max-w-md; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #1E3A5F; margin-top: 0;">${type}</h2>
          <p style="color: #444; line-height: 1.5;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">This is an official communication from Barangay Bella Luz.</p>
        </div>
      `
    })
    
    if (!emailRes.success) {
      console.error('Failed to send email broadcast', emailRes.error)
      // Continue anyway since DB insert succeeded
    }
  }

  revalidatePath('/admin/notifications')
  return { success: true }
}

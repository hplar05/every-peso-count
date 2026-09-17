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
      text: `${type}\n\n${message}\n\nThis is an official communication from Barangay Bella Luz.`
    })
    
    if (!emailRes.success) {
      console.error('Failed to send email broadcast', emailRes.error)
      // Continue anyway since DB insert succeeded
    }
  }

  revalidatePath('/admin/notifications')
  return { success: true }
}

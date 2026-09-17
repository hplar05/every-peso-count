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

export async function createSession(formData: FormData) {
  const supabase = await createClient()

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  const title = (formData.get('title') as string)?.trim()
  const session_date = formData.get('session_date') as string
  const type = formData.get('type') as string || 'regular'
  const status = formData.get('status') as string || 'scheduled'
  const agenda = (formData.get('agenda') as string)?.trim()

  if (!title) return { error: 'Session title is required.' }
  if (!session_date) return { error: 'Session date is required.' }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      title,
      session_date,
      type,
      status,
      agenda
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Created session', 'sessions', data.id)

  // Fire-and-forget: don't block response waiting for email
  sendEmail({
    to: ['brgy.bellaluz@example.com'],
    subject: `New Session Scheduled: ${title}`,
    text: `Session Scheduled\n\nA new ${type} session has been scheduled for ${session_date}.\n\nAgenda: ${agenda}`
  }).catch(err => console.error('[sendEmail] Failed to notify on session create:', err))

  revalidatePath('/admin/attendance')
  revalidatePath('/kagawads')
  return { success: true, id: data.id }
}

export async function updateSession(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const session_date = formData.get('session_date') as string
  const type = formData.get('type') as string
  const status = formData.get('status') as string
  const agenda = formData.get('agenda') as string

  const { error } = await supabase
    .from('sessions')
    .update({
      title,
      session_date,
      type,
      status,
      agenda
    })
    .eq('id', id)

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Updated session', 'sessions', id)

  revalidatePath('/admin/attendance')
  revalidatePath(`/admin/attendance/${id}`)
  revalidatePath('/kagawads')
  return { success: true }
}

export async function deleteSession(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Deleted session', 'sessions', id)

  revalidatePath('/admin/attendance')
  revalidatePath('/kagawads')
  return { success: true }
}

export async function saveAttendance(sessionId: string, attendanceRecords: { official_id: string, status: string }[]) {
  const supabase = await createClient()
  
  // Upsert attendance records
  // We include session_id in the records
  const upsertData = attendanceRecords.map(record => ({
    session_id: sessionId,
    official_id: record.official_id,
    status: record.status,
    scanned_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('attendance')
    .upsert(upsertData, { onConflict: 'session_id,official_id' })

  if (error) return { error: error.message }
  
  await logActivity(supabase, 'Updated attendance records', 'sessions', sessionId)

  revalidatePath(`/admin/attendance/${sessionId}`)
  revalidatePath('/kagawads')
  return { success: true }
}

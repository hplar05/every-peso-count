'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const BAD_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'crap', 'bastard', 'damn']

function isProfane(text: string) {
  const normalized = text.toLowerCase()
  return BAD_WORDS.some(word => normalized.includes(word))
}

function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function submitFeedback(formData: FormData) {
  const message = formData.get('message') as string
  const resident_name = (formData.get('resident_name') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null

  // 1. Basic Validation
  if (!message || message.trim().length < 5) {
    return { error: 'Message must be at least 5 characters long.' }
  }
  if (message.trim().length > 2000) {
    return { error: 'Message must be under 2000 characters.' }
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  // 2. Profanity Validation
  if (isProfane(message)) {
    return { error: "Your message contains inappropriate content and wasn't submitted. Please revise and try again." }
  }

  const supabase = await createClient()
  const tracking_code = generateTrackingCode()

  // 3. Insert into Database
  const { error } = await supabase
    .from('feedback')
    .insert({
      message: message.trim(),
      resident_name,
      email,
      tracking_code
    })

  if (error) {
    console.error('[submitFeedback] Insertion error:', error)
    return { error: 'Failed to submit feedback. Please try again later.' }
  }

  revalidatePath('/admin/feedback')
  return { success: true, tracking_code }
}

export async function checkFeedbackStatus(formData: FormData) {
  const tracking_code = formData.get('tracking_code') as string
  if (!tracking_code) return { error: 'Tracking code is required' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('feedback')
    .select(`
      status,
      response,
      created_at,
      officials ( name, role )
    `)
    .eq('tracking_code', tracking_code.toUpperCase().trim())
    .single()

  if (error || !data) {
    return { error: 'Invalid tracking code or feedback not found.' }
  }

  return { success: true, data }
}

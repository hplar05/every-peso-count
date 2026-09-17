"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Filter } from "bad-words"

const filter = new Filter()

// Add Tagalog and Ilocano profanity list
filter.addWords(
  'putangina', 'tangina', 'tngina', 'gago', 'tanga', 'bobo', 'inutil', 
  'ulol', 'pota', 'puta', 'tae', 'kantot', 'syota', 'bayag', 'titi', 
  'puke', 'pekpek', 'burat', 'siraulo', 'bwisit', 'punyeta', 'leche',
  'lintik', 'hindot', 'pakshet', 'ukinnam', 'okinam', 'kiki', 'gaga',
  'yawa', 'pisti', 'giatay', 'tang ina', 'putang ina', 'putragis', 'tarantado'
)

function generateTrackingCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function submitFeedback(formData: FormData) {
  const message = (formData.get("message") as string)?.trim()
  const resident_name = (formData.get("resident_name") as string)?.trim() || null
  const resident_email = (formData.get("resident_email") as string)?.trim() || null

  // 1. Basic validation
  if (!message || message.length < 10) {
    return { error: "Message must be at least 10 characters long." }
  }
  if (message.length > 2000) {
    return { error: "Message must be under 2000 characters." }
  }
  if (/^\s*$/.test(message)) {
    return { error: "Please enter a valid message." }
  }
  if (resident_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resident_email)) {
    return { error: "Please enter a valid email address." }
  }

  // 2. Profanity check (server-side, using bad-words package)
  if (filter.isProfane(message)) {
    return { error: "Your message contains inappropriate content and was not submitted. Please revise and try again." }
  }

  const supabase = await createClient()
  const tracking_code = generateTrackingCode()

  const { error } = await supabase.from("feedback").insert({
    message,
    resident_name,
    resident_email,
    tracking_code,
    status: "pending",
  })

  if (error) {
    console.error("[submitFeedback] Error:", error)
    return { error: "Failed to submit feedback. Please try again later." }
  }

  revalidatePath("/admin/feedback")
  revalidatePath("/feedback/board")
  return { success: true, tracking_code }
}

export async function checkFeedbackStatus(formData: FormData) {
  const tracking_code = formData.get("tracking_code") as string
  if (!tracking_code) return { error: "Tracking code is required" }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("feedback")
    .select("status, response, created_at, officials ( name, role )")
    .eq("tracking_code", tracking_code.toUpperCase().trim())
    .single()

  if (error || !data) {
    return { error: "Invalid tracking code or feedback not found." }
  }

  return { success: true, data }
}
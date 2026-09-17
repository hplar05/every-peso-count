"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/resend"

async function logActivity(supabase: any, action: string, targetTable: string, targetId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from("activity_log").insert({
      official_id: user.id,
      action,
      target_table: targetTable,
      target_id: targetId,
    })
  }
}

export async function updateFeedback(id: string, formData: FormData) {
  const status = formData.get("status") as string
  const response = formData.get("response") as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Get existing feedback to check for email
  const { data: existing } = await supabase
    .from("feedback")
    .select("resident_email, tracking_code, message")
    .eq("id", id)
    .single()

  const { error } = await supabase
    .from("feedback")
    .update({ status, response: response || null, handled_by: user.id })
    .eq("id", id)

  if (error) return { error: error.message }

  await logActivity(supabase, `Responded to feedback (${status})`, "feedback", id)

  // Send plain-text email if resolved and email exists
  if (status === "resolved" && existing?.resident_email) {
    await sendEmail({
      to: existing.resident_email,
      subject: `Your inquiry has been resolved - Every Peso Counts (${existing.tracking_code})`,
      text: [
        "Hello,",
        "",
        `Your inquiry submitted to Barangay Bella Luz (tracking code: ${existing.tracking_code}) has been resolved.`,
        "",
        "Official Response:",
        response || "(No response text provided)",
        "",
        "You can check your inquiry status at:",
        `https://everypesocount.online/feedback/status`,
        "",
        "Barangay Bella Luz - Every Peso Counts Transparency Portal",
        "everypesocount.online",
      ].join("\n"),
    })
  }

  revalidatePath("/admin/feedback")
  revalidatePath(`/admin/feedback/${id}`)
  revalidatePath("/feedback/board")
  return { success: true }
}
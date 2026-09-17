"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import QRCode from "qrcode"

export async function generateOfficialQR(officialId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: me } = await supabase.from("officials").select("role").eq("id", user.id).single()
  if (!me || !["admin", "secretary"].includes(me.role)) return { error: "Insufficient permissions" }

  // Generate QR code as data URL (PNG base64)
  try {
    const qrDataUrl = await QRCode.toDataURL(officialId, {
      width: 256,
      margin: 2,
      color: { dark: "#1E3A5F", light: "#ffffff" },
    })

    const { error } = await supabase
      .from("officials")
      .update({ qr_code: qrDataUrl })
      .eq("id", officialId)

    if (error) return { error: error.message }

    revalidatePath("/admin/staff")
    return { success: true, qrDataUrl }
  } catch (err: any) {
    return { error: err.message || "Failed to generate QR code" }
  }
}
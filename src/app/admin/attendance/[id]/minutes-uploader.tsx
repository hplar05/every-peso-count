"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileUp, FileText, Loader2, Trash2 } from "lucide-react"

export function MinutesUploader({ session }: { session: any }) {
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf" && !file.type.includes("wordprocessingml.document")) {
      toast.error("Please upload a PDF or DOCX file.")
      return
    }

    setUploading(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `${session.id}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from("minutes")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("minutes").getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from("sessions")
        .update({ minutes_file_url: data.publicUrl })
        .eq("id", session.id)

      if (updateError) throw updateError

      toast.success("Minutes uploaded successfully!")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (!confirm("Are you sure you want to remove the minutes file?")) return
    setUploading(true)
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ minutes_file_url: null })
        .eq("id", session.id)

      if (error) throw error
      toast.success("Minutes removed")
      router.refresh()
    } catch (err: any) {
      toast.error("Failed to remove minutes")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm h-full">
      <h3 className="text-sm font-medium text-[#1E3A5F] mb-4">Minutes of Meeting</h3>
      
      {session.minutes_file_url ? (
        <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-[#2563EB] rounded-sm">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#172033]">Minutes Attached</p>
              <a 
                href={session.minutes_file_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-[#2563EB] hover:underline"
              >
                View File
              </a>
            </div>
          </div>
          <button 
            onClick={handleRemove}
            disabled={uploading}
            className="p-2 text-red-500 hover:bg-red-50 rounded-sm transition-colors"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-sm p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
          <FileUp size={32} className="text-gray-400 mb-3" />
          <p className="text-sm font-medium text-[#172033] mb-1">Upload Minutes</p>
          <p className="text-xs text-gray-500 mb-4 text-center">PDF or DOCX files up to 5MB</p>
          
          <label className="relative cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-sm text-sm font-medium text-[#172033] hover:border-[#2563EB] transition-colors">
            {uploading ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Uploading...</span>
            ) : (
              <span>Select File</span>
            )}
            <input 
              type="file" 
              className="sr-only" 
              accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  )
}
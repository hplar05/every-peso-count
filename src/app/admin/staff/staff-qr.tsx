"use client"

import { useState } from "react"
import Image from "next/image"
import { QrCode, Download, Loader2 } from "lucide-react"
import { generateOfficialQR } from "./actions"
import { toast } from "sonner"

export function StaffQRPanel({ official }: { official: any }) {
  const [qr, setQr] = useState<string | null>(official.qr_code || null)
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    const res = await generateOfficialQR(official.id)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      setQr(res.qrDataUrl!)
      toast.success("QR code generated")
    }
  }

  function handleDownload() {
    if (!qr) return
    const a = document.createElement("a")
    a.href = qr
    a.download = `qr-${official.name.replace(/\s+/g, "-").toLowerCase()}.png`
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {qr ? (
        <>
          <Image src={qr} alt={`QR for ${official.name}`} width={80} height={80} className="border border-gray-200 rounded-sm" />
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-blue-800 transition-colors"
          >
            <Download size={12} /> Download
          </button>
        </>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F5F7FA] border border-gray-200 rounded-sm text-[#1E3A5F] hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />}
          {loading ? "Generating..." : "Generate QR"}
        </button>
      )}
    </div>
  )
}
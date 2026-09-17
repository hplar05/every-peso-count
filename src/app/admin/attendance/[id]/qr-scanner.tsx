"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Camera, CameraOff, Loader2 } from "lucide-react"

interface QRScannerProps {
  sessionId: string
  onScanned: (officialId: string) => void
}

export function QRScanner({ sessionId, onScanned }: QRScannerProps) {
  const [active, setActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const readerRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.stop?.().catch(() => {})
      }
    }
  }, [])

  async function startScanner() {
    setActive(true)
    setScanning(true)
    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const scanner = new Html5Qrcode("qr-reader")
      readerRef.current = scanner
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText: string) => {
          onScanned(decodedText)
          toast.success("QR scanned - marking attendance...")
        },
        undefined
      )
      setScanning(false)
    } catch (err: any) {
      toast.error("Camera not available. Use manual entry below.")
      setActive(false)
      setScanning(false)
    }
  }

  async function stopScanner() {
    if (readerRef.current) {
      await readerRef.current.stop().catch(() => {})
      readerRef.current = null
    }
    setActive(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-[#1E3A5F]">QR Code Scanner</h3>
          <p className="text-xs text-gray-500 mt-0.5">Scan an official QR code to mark them present instantly</p>
        </div>
        <button
          onClick={active ? stopScanner : startScanner}
          disabled={scanning}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-sm font-medium transition-colors ${
            active ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200" : "bg-[#1E3A5F] text-white hover:bg-blue-900"
          } disabled:opacity-50`}
        >
          {scanning ? <><Loader2 size={16} className="animate-spin" /> Starting...</> :
           active ? <><CameraOff size={16} /> Stop Scanner</> :
           <><Camera size={16} /> Start Scanner</>}
        </button>
      </div>
      {active && (
        <div className="flex justify-center">
          <div id="qr-reader" style={{ width: 300 }} className="rounded-sm overflow-hidden border border-gray-200" />
        </div>
      )}
    </div>
  )
}
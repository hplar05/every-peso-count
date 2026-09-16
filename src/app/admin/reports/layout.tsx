import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reports",
  description: "Generate and download official barangay transparency reports.",
}

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children
}
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Announcements",
  description: "Send official announcements and notifications to barangay officials.",
}

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portal Login",
  description: "Sign in to access the Barangay Bella Luz official portal.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
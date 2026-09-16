import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://every-peso-count.vercel.app'),
  title: {
    default: "Every Peso Counts - Barangay Bella Luz",
    template: "%s | Barangay Bella Luz"
  },
  description: "Barangay Bella Luz transparency portal. Track barangay projects, budget allocations, and citizen feedback to ensure full accountability.",
  keywords: ["barangay", "transparency", "budget", "projects", "Bella Luz", "San Mateo"],
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
    shortcut: "/logo.jpg",
  },
  openGraph: {
    title: "Every Peso Counts - Barangay Bella Luz",
    description: "Track how your barangay funds are being used.",
    type: "website",
    images: [{ url: "/logo.jpg" }],
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors closeButton duration={4000} />
      </body>
    </html>
  );
}

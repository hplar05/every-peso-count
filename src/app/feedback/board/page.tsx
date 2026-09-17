import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MessageSquare } from "lucide-react"

export const metadata = {
  title: "Public Feedback Board",
  description: "Browse resolved citizen inquiries and official responses from Barangay Bella Luz.",
}

export default async function FeedbackBoardPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from("feedback")
    .select("id, message, response, created_at, officials(name, role)")
    .eq("status", "resolved")
    .not("response", "is", null)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      <header className="bg-[#1E3A5F] py-4 px-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
              <Image src="/logo.jpg" alt="Barangay Bella Luz Logo" width={32} height={32} className="object-cover" />
            </div>
            <h1 className="font-medium text-lg tracking-tight text-white">Barangay Bella Luz</h1>
          </div>
          <Link href="/feedback" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Hub
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-[#1E3A5F] tracking-tight">Public Feedback Board</h2>
          <p className="text-gray-500 text-sm mt-1">
            Resolved citizen inquiries and official responses. All submissions are anonymous.
          </p>
        </div>

        {(!items || items.length === 0) ? (
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-12 text-center">
            <MessageSquare className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500 text-sm">No resolved inquiries to display yet.</p>
            <p className="text-gray-400 text-xs mt-1">Check back after official responses have been submitted.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="px-6 py-5">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{item.message}</p>
                </div>
                <div className="bg-[#F5F7FA] border-t border-gray-100 px-6 py-4">
                  <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Official Response</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.response}</p>
                  {item.officials && (
                    <p className="text-xs text-gray-400 mt-2">
                      — {item.officials.name} <span className="capitalize">({item.officials.role})</span>
                    </p>
                  )}
                </div>
                <div className="px-6 py-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full">Resolved</span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.updated_at || item.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
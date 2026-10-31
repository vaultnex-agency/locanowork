import type { Metadata } from "next"
import { ShieldAlert } from "lucide-react"
import { EmergencyDirectory } from "@/components/EmergencyDirectory"

export const metadata: Metadata = {
  title: "Essential & Emergency Services | LOCANO",
  description: "Find essential emergency helplines, nearest hospitals, and medical response numbers for Mangaluru.",
}

export default function EmergencyPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* HEADER SECTION */}
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#e11d48]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ESSENTIAL SUPPORT</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#10233f] sm:text-5xl">
            Emergency Help &amp; Hospitals
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Keep essential emergency services close at hand while you live and study in Mangaluru. Tap any number to call directly or detect nearest casualty centers via GPS.
          </p>
        </div>

        {/* INTERACTIVE DIRECTORY & HOSPITAL SEARCH */}
        <EmergencyDirectory />
      </div>
    </main>
  )
}

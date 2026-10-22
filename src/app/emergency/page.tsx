import type { Metadata } from "next"
import { Ambulance, Flame, HeartHandshake, Siren } from "lucide-react"

export const metadata: Metadata = {
  title: "Emergency Services | LOCANO",
  description: "Find essential emergency service contacts for Mangaluru.",
}

type EmergencyService = {
  name: string
  description: string
  icon: typeof Siren
}

const emergencyServices: EmergencyService[] = [
  {
    name: "Police",
    description: "For immediate safety concerns and police assistance.",
    icon: Siren,
  },
  {
    name: "Ambulance",
    description: "For urgent medical assistance and emergency transport.",
    icon: Ambulance,
  },
  {
    name: "Fire & Rescue",
    description: "For fire, rescue, and other life-threatening emergencies.",
    icon: Flame,
  },
  {
    name: "Women’s Helpline",
    description: "For women seeking urgent support or assistance.",
    icon: HeartHandshake,
  },
]

export default function EmergencyPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#1f6fe5]">
            ESSENTIAL SUPPORT
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#10233f] sm:text-5xl">
            Emergency Help
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Keep essential emergency services close at hand while you settle into Mangaluru.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {emergencyServices.map(({ name, description, icon: Icon }) => (
            <article
              key={name}
              className="locano-card flex min-h-56 flex-col justify-between border border-slate-100 bg-white p-5"
            >
              <div>
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1f6fe5]">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h2 className="text-base font-bold text-[#10233f]">{name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
              <p className="mt-6 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
                Contact number to be verified
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

import React from "react"
import { Ambulance, Flame, HeartHandshake, Shield } from "lucide-react"

const emergencyServices = [
  {
    name: "Police",
    description: "For immediate safety concerns and police assistance.",
    icon: Shield,
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
] as const

export function EmergencyServicesSection() {
  return (
    <section
      id="emergency-help"
      className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 bg-[#f4f8fc]"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#1f6fe5]">
            ESSENTIAL SUPPORT
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#10233f] sm:text-5xl">
            Emergency Help
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Keep essential emergency services close at hand while you settle into Mangaluru.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {emergencyServices.map(({ name, description, icon: Icon }) => (
            <article
              key={name}
              className="locano-card locano-card-interactive flex min-h-56 flex-col justify-between border border-slate-100 p-5"
            >
              <div>
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1f6fe5]">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[#10233f]">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
              <p className="mt-6 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
                Contact number to be verified
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

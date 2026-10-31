import type { Metadata } from "next"
import { Outfit, Fraunces } from "next/font/google"
import "./globals.css"
import { ModalProvider } from "@/context/ModalContext"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { SearchModal } from "@/components/SearchModal"
import { AccountModal } from "@/components/AccountModal"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "LOCANO - settling made simple",
    template: "%s · LOCANO",
  },
  description:
    "Search bus routes, bus numbers and real-time updates in Mangaluru in seconds. Find your bus and reach anywhere in Mangalore.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-[#10233f] font-sans antialiased">
        <ModalProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <SearchModal />
          <AccountModal />
        </ModalProvider>
      </body>
    </html>
  )
}

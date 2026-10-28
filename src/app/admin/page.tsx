"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Bell, Building2, Utensils, CheckCircle2, XCircle,
  Eye, EyeOff, LayoutDashboard, Clock, ChevronRight,
  AlertCircle, RefreshCw, ShieldCheck, LogOut, Loader2,
  BadgeCheck, Ban, MessageSquare, UserPlus, LogIn, Home,
} from "lucide-react"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

// ─── Types ────────────────────────────────────────────────────────────────────
type NotifType =
  | "signup" | "login" | "listing_submitted"
  | "listing_approved" | "listing_rejected" | "enquiry_created"

interface AdminNotif {
  id: string
  notification_type: NotifType
  user_id: string | null
  listing_id: string | null
  title: string
  message: string
  read: boolean
  metadata: Record<string, unknown>
  created_at: string
}

interface PendingListing {
  id: string
  name: string
  area: string
  owner_id: string | null
  created_at: string
  monthly_rent_from?: number
  monthly_price_from?: number
  type?: string
  gender?: string
  dietary?: string
  service_type?: string
  category: "accommodation" | "mess"
}

type Section = "overview" | "notifications" | "listings"

// ─── Notification config ──────────────────────────────────────────────────────
const NOTIF_CFG: Record<NotifType, { label: string; pill: string; Icon: React.ElementType }> = {
  signup:            { label: "Sign Up",   pill: "bg-blue-50 text-blue-700 border-blue-200",         Icon: UserPlus },
  login:             { label: "Login",     pill: "bg-slate-50 text-slate-600 border-slate-200",      Icon: LogIn },
  listing_submitted: { label: "Submitted", pill: "bg-amber-50 text-amber-700 border-amber-200",      Icon: Clock },
  listing_approved:  { label: "Approved",  pill: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: BadgeCheck },
  listing_rejected:  { label: "Rejected",  pill: "bg-red-50 text-red-700 border-red-200",            Icon: Ban },
  enquiry_created:   { label: "Enquiry",   pill: "bg-violet-50 text-violet-700 border-violet-200",   Icon: MessageSquare },
}

const FILTER_ORDER: Array<NotifType | "all"> = [
  "all", "enquiry_created", "listing_submitted", "signup",
  "login", "listing_approved", "listing_rejected",
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [authState, setAuthState] = useState<"checking" | "ok" | "denied">("checking")
  const [adminEmail, setAdminEmail] = useState("")
  const [section, setSection] = useState<Section>("overview")
  const [notifs, setNotifs] = useState<AdminNotif[]>([])
  const [listings, setListings] = useState<PendingListing[]>([])
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [notifFilter, setNotifFilter] = useState<NotifType | "all">("all")

  // ── Auth check ───────────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkAdminAuth() {
      if (!isSupabaseConfigured()) { setAuthState("denied"); return }
      const supabase = getSupabaseBrowserClient()
      if (!supabase) { setAuthState("denied"); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/login"); return }
      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single()
      if (profile?.role !== "admin") { router.replace("/"); return }
      setAdminEmail(user.email ?? "")
      setAuthState("ok")
    }
    void checkAdminAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch data ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    setLoading(true)

    const [{ data: nd }, { data: ad }, { data: md }] = await Promise.all([
      supabase.from("admin_notifications").select("*")
        .order("created_at", { ascending: false }).limit(150),
      supabase.from("accommodation_listings")
        .select("id,name,area,owner_id,created_at,monthly_rent_from,type,gender")
        .eq("status", "pending").eq("is_demo", false)
        .order("created_at", { ascending: false }),
      supabase.from("mess_listings")
        .select("id,name,area,owner_id,created_at,monthly_price_from,dietary,service_type")
        .eq("status", "pending").eq("is_demo", false)
        .order("created_at", { ascending: false }),
    ])

    if (nd) setNotifs(nd as AdminNotif[])

    const combined: PendingListing[] = [
      ...(ad ?? []).map((l) => ({ ...l, category: "accommodation" as const })),
      ...(md ?? []).map((l) => ({ ...l, category: "mess" as const })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setListings(combined)
    setLoading(false)
  }, [])

  // Trigger data fetch on mount once auth is confirmed
  useEffect(() => {
    if (authState === "ok") {
      const timer = setTimeout(() => {
        void fetchData()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [authState, fetchData])

  // ── Actions ──────────────────────────────────────────────────────────────────
  async function markRead(id: string) {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from("admin_notifications").update({ read: true }).eq("id", id)
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    await supabase.from("admin_notifications").update({ read: true }).eq("read", false)
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function handleAction(listing: PendingListing, action: "published" | "rejected") {
    setActionId(listing.id)
    const supabase = getSupabaseBrowserClient()
    if (!supabase) { setActionId(null); return }

    const table = listing.category === "accommodation" ? "accommodation_listings" : "mess_listings"
    const { error } = await supabase.from(table).update({ status: action }).eq("id", listing.id)

    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== listing.id))
      const notifType = action === "published" ? "listing_approved" : "listing_rejected"
      await supabase.from("admin_notifications").insert({
        notification_type: notifType,
        user_id: listing.owner_id,
        listing_id: listing.id,
        title: `${action === "published" ? "Approved" : "Rejected"}: ${listing.name}`,
        message: `"${listing.name}" in ${listing.area} was ${action === "published" ? "approved and is now live" : "rejected"}.`,
        metadata: { listing_name: listing.name, area: listing.area, category: listing.category },
      })
      await fetchData()
    }
    setActionId(null)
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    if (supabase) await supabase.auth.signOut()
    router.replace("/")
  }

  // ── Derived ──────────────────────────────────────────────────────────────────
  const unread = notifs.filter((n) => !n.read).length
  const enquiries = notifs.filter((n) => n.notification_type === "enquiry_created").length
  const filtered = notifFilter === "all" ? notifs : notifs.filter((n) => n.notification_type === notifFilter)

  const navItems: Array<{ id: Section; label: string; Icon: React.ElementType; badge?: number }> = [
    { id: "overview",      label: "Overview",        Icon: LayoutDashboard },
    { id: "notifications", label: "Notifications",    Icon: Bell,      badge: unread },
    { id: "listings",      label: "Pending Listings", Icon: Building2, badge: listings.length },
  ]

  // ── Guard states ─────────────────────────────────────────────────────────────
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-[#10233f]">Supabase Not Configured</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Add your environment variables to{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> to use the admin panel.
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#1f6fe5] font-semibold hover:underline">
            <Home className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    )
  }

  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1f6fe5] animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Verifying admin access…</p>
        </div>
      </div>
    )
  }

  if (authState === "denied") return null

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4f9]">

      {/* ── Dark sidebar (desktop) ── */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-[#041422] flex-col z-40 hidden lg:flex">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck className="w-4 h-4 text-[#1f6fe5]" />
            <span className="text-[10px] font-bold text-[#1f6fe5] uppercase tracking-widest">Admin Panel</span>
          </div>
          <div className="text-lg font-extrabold text-white tracking-tight">LOCANO</div>
          <p className="text-[11px] text-white/40 mt-0.5 truncate">{adminEmail}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, Icon, badge }) => (
            <button key={id} onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                section === id ? "bg-[#1f6fe5] text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${section === id ? "bg-white/20 text-white" : "bg-[#1f6fe5] text-white"}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button onClick={fetchData} disabled={loading}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh data
          </button>
          <Link href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to site
          </Link>
          <button onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#041422] px-4 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1f6fe5]" />
          <span className="text-sm font-bold text-white">LOCANO Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} disabled={loading} className="p-2 text-white/60 hover:text-white disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={signOut} className="p-2 text-red-400 hover:text-red-300">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex safe-area-bottom">
        {navItems.map(({ id, label, Icon, badge }) => (
          <button key={id} onClick={() => setSection(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors relative ${section === id ? "text-[#1f6fe5]" : "text-slate-500"}`}
          >
            <Icon className="w-5 h-5" />
            <span>{label.split(" ")[0]}</span>
            {badge != null && badge > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-14px)] min-w-[16px] h-4 text-[9px] font-bold bg-[#1f6fe5] text-white rounded-full flex items-center justify-center px-1">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="lg:ml-60 pt-14 lg:pt-0 pb-24 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* ════ OVERVIEW ════ */}
          {section === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#10233f]">Dashboard</h1>
                  <p className="text-sm text-slate-500 mt-0.5">Welcome back, Admin.</p>
                </div>
                <span className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1f6fe5]" />
                  {adminEmail}
                </span>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Unread Alerts",      value: unread,          Icon: Bell,         bg: "bg-blue-50 border-blue-100",     icon: "text-[#1f6fe5]" },
                  { label: "Pending Listings",    value: listings.length, Icon: Clock,        bg: "bg-amber-50 border-amber-100",   icon: "text-amber-600" },
                  { label: "Total Enquiries",     value: enquiries,       Icon: MessageSquare, bg: "bg-violet-50 border-violet-100", icon: "text-violet-600" },
                  { label: "All Notifications",   value: notifs.length,   Icon: Bell,         bg: "bg-emerald-50 border-emerald-100", icon: "text-emerald-600" },
                ].map(({ label, value, Icon: SI, bg, icon }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
                      <SI className={`w-5 h-5 ${icon}`} />
                    </div>
                    <div className="text-2xl font-extrabold text-[#10233f]">{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-[#10233f]">Recent Activity</h2>
                  <button onClick={() => setSection("notifications")}
                    className="text-xs text-[#1f6fe5] font-semibold flex items-center gap-1 hover:underline">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {loading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 text-slate-300 animate-spin" /></div>
                  ) : notifs.slice(0, 8).map((n) => {
                    const cfg = NOTIF_CFG[n.notification_type]
                    return (
                      <div key={n.id} className={`flex items-start gap-3 px-5 py-3 ${!n.read ? "bg-blue-50/30" : ""}`}>
                        <div className={`mt-0.5 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${cfg.pill}`}>
                          <cfg.Icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#10233f] truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </span>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-[#1f6fe5] shrink-0" />}
                        </div>
                      </div>
                    )
                  })}
                  {!loading && notifs.length === 0 && (
                    <div className="px-5 py-10 text-center text-sm text-slate-400">No activity yet.</div>
                  )}
                </div>
              </div>

              {/* Pending listings quick view */}
              {listings.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-[#10233f] flex items-center gap-2">
                      Pending Listings
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{listings.length}</span>
                    </h2>
                    <button onClick={() => setSection("listings")}
                      className="text-xs text-[#1f6fe5] font-semibold flex items-center gap-1 hover:underline">
                      Review all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {listings.slice(0, 5).map((l) => (
                      <div key={l.id} className="flex items-center justify-between gap-4 px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${l.category === "mess" ? "bg-orange-50" : "bg-blue-50"}`}>
                            {l.category === "mess" ? <Utensils className="w-4 h-4 text-orange-500" /> : <Building2 className="w-4 h-4 text-[#1f6fe5]" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#10233f] truncate">{l.name}</p>
                            <p className="text-[11px] text-slate-400">{l.area} · {l.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleAction(l, "published")} disabled={actionId === l.id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50">
                            {actionId === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Approve
                          </button>
                          <button onClick={() => handleAction(l, "rejected")} disabled={actionId === l.id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ NOTIFICATIONS ════ */}
          {section === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-extrabold text-[#10233f]">Notifications</h1>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1f6fe5] px-3 py-2 rounded-full border border-slate-200 bg-white hover:border-[#1f6fe5] transition-all">
                    <Eye className="w-3.5 h-3.5" /> Mark all read ({unread})
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {FILTER_ORDER.map((f) => (
                  <button key={f} onClick={() => setNotifFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                      notifFilter === f ? "bg-[#1f6fe5] text-white border-[#1f6fe5] shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}>
                    {f === "all" ? `All (${notifs.length})` : NOTIF_CFG[f]?.label ?? f}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50 max-h-[68vh] overflow-y-auto">
                  {loading ? (
                    <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>
                  ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-400">No notifications in this category.</div>
                  ) : filtered.map((n) => {
                    const cfg = NOTIF_CFG[n.notification_type]
                    return (
                      <div key={n.id} className={`flex items-start gap-4 px-5 py-4 transition-colors group ${!n.read ? "bg-blue-50/30" : "hover:bg-slate-50/50"}`}>
                        <div className={`mt-0.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${cfg.pill}`}>
                          <cfg.Icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#10233f]">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          {n.listing_id && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Listing: <code className="bg-slate-100 px-1 rounded font-mono">{n.listing_id}</code>
                            </p>
                          )}
                          {Boolean((n.metadata as Record<string, unknown> | null)?.student_email) && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Student: <span className="font-semibold text-slate-600">{String((n.metadata as Record<string, unknown>).student_email)}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!n.read ? (
                            <button onClick={() => markRead(n.id)}
                              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-[#1f6fe5] font-semibold transition-colors opacity-0 group-hover:opacity-100">
                              <EyeOff className="w-3 h-3" /> Mark read
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300 flex items-center gap-1"><Eye className="w-3 h-3" /> Read</span>
                          )}
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-[#1f6fe5] mt-1.5 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ PENDING LISTINGS ════ */}
          {section === "listings" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-extrabold text-[#10233f]">Pending Listings</h1>

              {loading ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 flex justify-center">
                  <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                </div>
              ) : listings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">All clear!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending listings waiting for review.</p>
                </div>
              ) : listings.map((l) => (
                <div key={l.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${l.category === "mess" ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"}`}>
                        {l.category === "mess" ? <Utensils className="w-6 h-6 text-orange-500" /> : <Building2 className="w-6 h-6 text-[#1f6fe5]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${l.category === "mess" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                            {l.category === "mess" ? "Mess / Food" : "Accommodation"}
                          </span>
                          {l.type && <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{l.type}</span>}
                          {l.gender && <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{l.gender}</span>}
                          {l.dietary && <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{l.dietary}</span>}
                        </div>
                        <h3 className="text-base font-bold text-[#10233f]">{l.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{l.area}, Mangaluru</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            ₹{((l.monthly_rent_from ?? l.monthly_price_from) ?? 0).toLocaleString("en-IN")}/month
                          </span>
                          <span>·</span>
                          <span>Submitted {new Date(l.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 font-mono">ID: {l.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-stretch">
                      <button onClick={() => handleAction(l, "published")} disabled={actionId === l.id}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20 disabled:opacity-50 whitespace-nowrap">
                        {actionId === l.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve & Publish
                      </button>
                      <button onClick={() => handleAction(l, "rejected")} disabled={actionId === l.id}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

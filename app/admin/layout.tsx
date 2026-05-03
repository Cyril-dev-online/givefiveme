"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin-login")
  }

<Link
  href="/admin/viral-moments"
  className="group rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-6 transition hover:bg-emerald-400/20"
>
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-emerald-300">
      Viral moments
    </h3>

    <span className="text-xs text-emerald-300/60 group-hover:text-emerald-200">
      → open
    </span>
  </div>

  <p className="mt-2 text-sm text-white/60">
    Moments à filmer (TikTok / X)
  </p>
</Link>

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0b1120] border-r border-slate-800 p-6">
        <h2 className="text-xl font-bold mb-10 tracking-wide">
          Admin Panel
        </h2>

        <nav className="flex flex-col gap-4 text-slate-400">
          <Link href="/admin" className="hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/admin/users" className="hover:text-white transition">
            Users
          </Link>
          <Link href="/admin/settings" className="hover:text-white transition">
            Settings
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-10 bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  )
}
import type React from "react"
import { cookies } from "next/headers"
import { AdminHeader } from "@/components/admin/admin-header"
import { MobileNav } from "@/components/admin/mobile-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")?.value === "true"

  // Allow access to login page without authentication
  if (!isAuthenticated) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex flex-1 flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-40">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

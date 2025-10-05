"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6 lg:px-8">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/admin">
            <span className="font-bold">E-Cell Admin</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

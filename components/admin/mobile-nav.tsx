"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, BarChart3, Settings } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div 
        className="bg-black/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-gray-800"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <nav className="flex items-center gap-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl transition-all duration-300 active:scale-95",
                  item.name === "Dashboard" || item.name === "Settings" 
                    ? "px-3 py-2" 
                    : "px-4 py-3",
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 shadow-lg transform scale-105 border border-orange-500/30"
                    : "text-white/70 hover:text-white hover:bg-white/10 hover:scale-105"
                )}
                style={{
                  backdropFilter: isActive ? 'none' : 'blur(10px)'
                }}
              >
                <item.icon className="h-4 w-4 transition-all duration-300" />
                <span className={cn(
                  "font-medium transition-all duration-300",
                  item.name === "Dashboard" || item.name === "Settings" 
                    ? "text-[9px]" 
                    : "text-[10px]"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
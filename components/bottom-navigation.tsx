"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, BarChart3, User, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/shops", icon: Store, label: "Shops" },
  { href: "/transactions", icon: Receipt, label: "Transactions" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href === "/transactions" && pathname.startsWith("/transactions"))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-2 rounded-lg transition-colors min-w-0",
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-blue-600")} />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

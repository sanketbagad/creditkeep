"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, User, Receipt, HandCoins, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/shops", icon: Store, label: "Shops" },
  { href: "/transactions", icon: Receipt, label: "Transactions" },
  { href: "/lending", icon: HandCoins, label: "Lending" },
  { href: "/borrower-lookup", icon: CreditCard, label: "Borrow" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNavigation() {
  const pathname = usePathname()

  const activeIndex = navItems.findIndex((item) => {
    if (pathname === item.href) return true
    if (item.href === "/transactions" && pathname.startsWith("/transactions")) return true
    if (item.href === "/lending" && pathname.startsWith("/lending")) return true
    if (item.href === "/borrower-lookup" && pathname.startsWith("/borrower-lookup")) return true
    return false
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="flex items-end justify-center px-6 pb-6">
        <div className="flex items-center justify-center space-x-2 p-2 rounded-full bg-white shadow-lg border border-gray-100">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300",
                  "group active:scale-95",
                  isActive
                    ? "bg-blue-500 text-white shadow-lg scale-110"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50",
                )}
              >
                <Icon className="w-5 h-5" />

                {/* Active indicator dot */}
                {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}

                {/* Tooltip label */}
                <div
                  className={cn(
                    "absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap transition-all duration-200",
                    "opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100",
                    isActive && "opacity-0",
                  )}
                >
                  {item.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

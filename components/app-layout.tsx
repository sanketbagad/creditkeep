"use client"

import type React from "react"
import { usePathname } from "next/navigation"

import { BottomNavigation } from "./bottom-navigation"
import { FloatingActionButton } from "./floating-action-button"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()

  // Show FAB on main pages but not on add/edit pages
  const showFAB =
    ["/dashboard", "/shops", "/transactions", "/analytics", "/lending"].includes(pathname) ||
    (pathname.startsWith("/shops/") && !pathname.includes("/edit"))

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        <main className="max-w-md mx-auto bg-white min-h-screen">{children}</main>
        {showFAB && <FloatingActionButton />}
      </div>
      <BottomNavigation />
    </>
  )
}

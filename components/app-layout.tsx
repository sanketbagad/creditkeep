"use client"

import type React from "react"

import { BottomNavigation } from "./bottom-navigation"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-md mx-auto bg-white min-h-screen">{children}</main>
      <BottomNavigation />
    </div>
  )
}

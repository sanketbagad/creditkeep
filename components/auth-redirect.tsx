"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthRedirectProps {
  children: React.ReactNode
}

export function AuthRedirect({ children }: AuthRedirectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        setIsAuthenticated(true)

        // Redirect to dashboard if user is on login/signup/home pages
        if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
          router.push("/dashboard")
          return
        }
      } else {
        setIsAuthenticated(false)

        // Redirect to login if user is on protected pages
        const protectedPaths = ["/dashboard", "/shops", "/transactions", "/analytics", "/profile"]
        const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

        if (isProtectedPath) {
          router.push("/login")
          return
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
    } finally {
      setIsChecking(false)
    }
  }

  // Show loading spinner while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">CreditKeep</h2>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <p className="text-gray-600 text-sm mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

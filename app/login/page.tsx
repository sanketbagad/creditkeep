"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Eye, EyeOff, Sparkles, Loader2, CheckCircle2 } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com")
  const [password, setPassword] = useState("demo123")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking")
  const router = useRouter()

  useEffect(() => {
    // Check database health on component mount
    checkDatabaseHealth()
  }, [])

  const checkDatabaseHealth = async () => {
    try {
      setDbStatus("checking")
      const response = await fetch("/api/health")
      const data = await response.json()

      if (response.ok && data.status === "healthy") {
        setDbStatus("connected")
      } else {
        setDbStatus("error")
        setError("Database connection issue. Please try again later.")
      }
    } catch (error) {
      setDbStatus("error")
      setError("Failed to check database health")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/dashboard")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail("demo@example.com")
    setPassword("demo123")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* Navbar */}
        <Navbar showAuthButtons={false} />

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-6 pt-8">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome back
              </CardTitle>
              <CardDescription className="text-gray-600">Sign in to your CreditKeep account</CardDescription>

              {/* Database Status Indicator */}
              <div className="flex items-center justify-center gap-1 mt-2">
                {dbStatus === "checking" && (
                  <div className="flex items-center text-yellow-600 text-xs bg-yellow-50 px-2 py-1 rounded-full">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Checking database...
                  </div>
                )}
                {dbStatus === "connected" && (
                  <div className="flex items-center text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Database connected
                  </div>
                )}
                {dbStatus === "error" && (
                  <div className="flex items-center text-red-600 text-xs bg-red-50 px-2 py-1 rounded-full">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Database error
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p>{error}</p>
                      {error.includes("Database") && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={checkDatabaseHealth}
                          className="text-red-600 p-0 h-auto mt-1"
                        >
                          Retry connection
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-70"
                  disabled={loading || dbStatus === "error"}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Sign up
                </Link>
              </div>

              {/* Demo credentials */}
              <div className="text-center text-xs bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="font-medium text-blue-800 mb-2">Demo Account Ready!</p>
                <p className="text-blue-700 mb-1">Email: demo@example.com</p>
                <p className="text-blue-700 mb-3">Password: demo123</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoCredentials}
                  className="text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  Use Demo Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

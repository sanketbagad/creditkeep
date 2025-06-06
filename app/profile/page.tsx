"use client"

import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, LogOut, Settings, HelpCircle, Phone, Edit, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"

interface UserProfile {
  id: number
  name: string
  email: string
  mobile: string | null
  createdAt: string
  stats: {
    totalShops: number
    totalTransactions: number
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatMobileNumber = (mobile: string) => {
    if (!mobile) return ""
    const digits = mobile.replace(/\D/g, "")
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return mobile
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Navbar showAuthButtons={true} userName="Loading..." />
        <div className="p-4 space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
          <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Navbar showAuthButtons={true} userName={user?.name || "User"} />
      <AppLayout>
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="text-center relative">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-600">Account Information</p>

            <Link href="/profile/edit" className="absolute right-0 top-0">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </Link>
          </div>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              {user?.mobile && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-medium">{formatMobileNumber(user.mobile)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{user?.stats?.totalShops || 0}</p>
                  <p className="text-sm text-gray-600">Shops</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{user?.stats?.totalTransactions || 0}</p>
                  <p className="text-sm text-gray-600">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="space-y-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Settings</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={
              () => {
                router.push("/help") 
              }
            }>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Help & Support</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleLogout}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-600">Logout</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>CreditKeep By Botbyte AI</strong>
                </p>
                <p>Version 2.1.5</p>
                <p>Keep track of your daily borrowings and payments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </div>
  )
}

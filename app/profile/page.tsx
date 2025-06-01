"use client"

import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, LogOut, Settings, HelpCircle } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account</p>
        </div>

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

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                <strong>Borrowing Tracker</strong>
              </p>
              <p>Version 1.0.0</p>
              <p>Keep track of your daily borrowings and payments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

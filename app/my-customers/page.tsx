"use client"
import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Phone,
  Search,
  Calendar,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

// ...existing imports...
interface Borrower {
  name: string
  mobile: string
  total_borrowed: number
}

export default function MyCustomersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [myMobile, setMyMobile] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchBorrowers()
  }, [])

  const fetchBorrowers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/my-customers")
      if (response.ok) {
        const data = await response.json()
        setBorrowers(data.borrowers)
        setMyMobile(data.my_mobile)
      } else {
        console.error("Failed to fetch borrowers")
      }
    } catch (error) {
      console.error("Error fetching borrowers:", error)
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

  const filteredBorrowers = borrowers.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobile.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Navbar showAuthButtons={true} userName="User" />
        <div className="p-4 space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Navbar showAuthButtons={true} userName="User" />
      <AppLayout>
        <div className="p-4 space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                My Customers
              </h1>
              <p className="text-gray-600 text-sm">
                Customers who have borrowed from your shops
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Your mobile: <span className="font-mono">{formatMobileNumber(myMobile)}</span>
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search customers by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {filteredBorrowers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">
                    {searchTerm ? "No customers found matching your search" : "No customers yet"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {searchTerm
                      ? "Try a different search term"
                      : "Customers will appear here when they borrow from your shops"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredBorrowers.map((b, idx) => (
                <Card key={b.mobile + idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{b.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="h-3 w-3" />
                        <span>{formatMobileNumber(b.mobile)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        ₹{b.total_borrowed.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Total Borrowed</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/shops">
                <Button variant="outline" className="w-full justify-between">
                  <span>Manage Shops</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline" className="w-full justify-between">
                  <span>View All Transactions</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </div>
  )
}
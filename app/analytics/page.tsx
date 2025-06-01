"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"

interface AnalyticsData {
  totalBalance: number
  monthlySpending: Array<{
    month: string
    borrowed: number
    paid: number
  }>
  topShops: Array<{
    name: string
    balance: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      const data = await response.json()

      if (response.ok) {
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </AppLayout>
    )
  }

  if (!analytics) {
    return (
      <AppLayout>
        <div className="p-4">
          <p className="text-gray-600">Failed to load analytics</p>
        </div>
      </AppLayout>
    )
  }

  const currentMonth = analytics.monthlySpending[0]
  const previousMonth = analytics.monthlySpending[1]

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Your spending insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-600">Total Owed</span>
              </div>
              <p className="text-2xl font-bold text-red-600">₹{analytics.totalBalance.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">This Month</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ₹{currentMonth ? Number.parseFloat(currentMonth.borrowed).toFixed(2) : "0.00"}
              </p>
              <p className="text-xs text-gray-500">Borrowed</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Comparison */}
        {currentMonth && previousMonth && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Borrowed this month</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">₹{Number.parseFloat(currentMonth.borrowed).toFixed(2)}</span>
                  {Number.parseFloat(currentMonth.borrowed) > Number.parseFloat(previousMonth.borrowed) ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Paid this month</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">₹{Number.parseFloat(currentMonth.paid).toFixed(2)}</span>
                  {Number.parseFloat(currentMonth.paid) > Number.parseFloat(previousMonth.paid) ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Shops */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Outstanding Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topShops.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No outstanding balances</p>
            ) : (
              <div className="space-y-3">
                {analytics.topShops.map((shop, index) => (
                  <div key={shop.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <span className="font-medium">{shop.name}</span>
                    </div>
                    <span className="font-bold text-red-600">
                      ₹{Number.parseFloat(shop.balance.toString()).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Months</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.monthlySpending.map((month) => (
                <div key={month.month} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">
                      {new Date(month.month).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Borrowed: </span>
                      <span className="font-medium text-red-600">₹{Number.parseFloat(month.borrowed).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Paid: </span>
                      <span className="font-medium text-green-600">₹{Number.parseFloat(month.paid).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

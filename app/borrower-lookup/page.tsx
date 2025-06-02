"use client"
import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  User,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  HandCoins,
  Minus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  RefreshCw,
} from "lucide-react"

interface LenderDetails {
  lender_id: number
  lender_name: string
  lender_mobile: string
  total_borrowed: number
  total_repaid: number
  outstanding_balance: number
  last_transaction_date: string
  transaction_count: number
  transactions: any[]
}

interface BorrowingData {
  borrower_name: string
  borrower_mobile: string
  lenders: LenderDetails[]
  summary: {
    total_lenders: number
    total_borrowed: number
    total_repaid: number
    total_outstanding: number
    total_transactions: number
  }
}

export default function BorrowerLookupPage() {
  const [borrowingData, setBorrowingData] = useState<BorrowingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const formatMobileNumber = (mobile: string) => {
    const digits = mobile.replace(/\D/g, "")
    if (digits.length >= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    } else if (digits.length >= 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`
    }
    return digits
  }

  const fetchBorrowingData = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/my-borrowing")
      const data = await response.json()

      if (response.ok) {
        setBorrowingData(data)
      } else {
        setError(data.error || "Failed to fetch borrowing details")
      }
    } catch (error) {
      console.error("Error fetching borrowing details:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBorrowingData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Navbar showAuthButtons={false} />
        <AppLayout>
          <div className="p-4 space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </AppLayout>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Navbar showAuthButtons={false} />
        <AppLayout>
          <div className="p-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchBorrowingData} variant="outline" className="border-red-300 text-red-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Navbar showAuthButtons={false} />
      <AppLayout>
        <div className="p-4 space-y-6 pt-2">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">My Borrowing</h1>
            <p className="text-gray-600 mt-1">People you've borrowed money from</p>
          </div>

          {borrowingData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      ₹{borrowingData.summary.total_borrowed.toFixed(0)}
                    </p>
                    <p className="text-xs text-blue-600">Total Borrowed</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-700">
                      ₹{borrowingData.summary.total_outstanding.toFixed(0)}
                    </p>
                    <p className="text-xs text-orange-600">Outstanding</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      ₹{borrowingData.summary.total_repaid.toFixed(0)}
                    </p>
                    <p className="text-xs text-green-600">Total Repaid</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{borrowingData.summary.total_lenders}</p>
                    <p className="text-xs text-purple-600">Lenders</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lenders List */}
              {borrowingData.lenders.length === 0 ? (
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">All Clear! 🎉</h3>
                    <p className="text-green-700">You don't owe money to anyone</p>
                    <p className="text-sm text-green-600 mt-2">Your borrowing slate is clean!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">People You Owe Money To</h2>

                  {borrowingData.lenders.map((lender) => (
                    <Card key={lender.lender_id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">{lender.lender_name}</h3>
                                {lender.outstanding_balance > 0 ? (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    You Owe
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Settled
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {formatMobileNumber(lender.lender_mobile)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className={`text-xl font-bold ${
                                lender.outstanding_balance > 0 ? "text-orange-600" : "text-green-600"
                              }`}
                            >
                              ₹{lender.outstanding_balance.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {lender.outstanding_balance > 0 ? "Outstanding" : "Settled"}
                            </p>
                          </div>
                        </div>

                        {/* Transaction Summary */}
                        <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-sm font-medium text-blue-600">₹{lender.total_borrowed.toFixed(0)}</p>
                            <p className="text-xs text-gray-600">Borrowed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-600">₹{lender.total_repaid.toFixed(0)}</p>
                            <p className="text-xs text-gray-600">Repaid</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">{lender.transaction_count}</p>
                            <p className="text-xs text-gray-600">Transactions</p>
                          </div>
                        </div>

                        {/* Last Transaction */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last: {new Date(lender.last_transaction_date).toLocaleDateString()}
                          </span>
                          {lender.outstanding_balance > 0 && (
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              Contact Lender
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Recent Transactions */}
              {borrowingData.lenders.some((lender) => lender.transactions.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {borrowingData.lenders
                        .flatMap((lender) =>
                          lender.transactions.map((transaction) => ({
                            ...transaction,
                            lender_name: lender.lender_name,
                            lender_mobile: lender.lender_mobile,
                          })),
                        )
                        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                        .slice(0, 5)
                        .map((transaction) => (
                          <div key={transaction.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div
                              className={`p-2 rounded-full ${
                                transaction.type === "lend"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {transaction.type === "lend" ? (
                                <HandCoins className="h-4 w-4" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900 truncate">{transaction.lender_name}</p>
                                <Badge
                                  variant={transaction.type === "lend" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {transaction.type === "lend" ? "Borrowed" : "Repaid"}
                                </Badge>
                              </div>
                              {transaction.description && (
                                <p className="text-sm text-gray-600 truncate mb-1">{transaction.description}</p>
                              )}
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(transaction.transaction_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${
                                  transaction.type === "lend" ? "text-blue-600" : "text-green-600"
                                }`}
                              >
                                {transaction.type === "lend" ? "+" : "-"}₹{Number(transaction.amount).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </AppLayout>
    </div>
  )
}

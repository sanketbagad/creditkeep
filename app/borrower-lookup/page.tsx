"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Phone, User, Search, Calendar, HandCoins, Minus, AlertCircle } from "lucide-react"

interface BorrowerDetails {
  borrower_name: string
  borrower_mobile: string
  lenders: Array<{
    lender_id: number
    lender_name: string
    lender_mobile: string
    total_borrowed: number
    total_repaid: number
    balance: number
    transactions: Array<{
      id: number
      amount: number
      type: "lend" | "repayment"
      description: string
      transaction_date: string
      created_at: string
    }>
  }>
  total_transactions: number
}

export default function BorrowerLookupPage() {
  const [mobile, setMobile] = useState("")
  const [loading, setLoading] = useState(false)
  const [borrowerDetails, setBorrowerDetails] = useState<BorrowerDetails | null>(null)
  const [error, setError] = useState("")

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, "")
    const limitedDigits = digits.slice(0, 10)

    if (limitedDigits.length >= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`
    } else if (limitedDigits.length >= 3) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`
    }
    return limitedDigits
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMobileNumber(e.target.value)
    setMobile(formatted)
  }

  const validateMobile = (mobile: string) => {
    const digits = mobile.replace(/\D/g, "")
    return digits.length === 10
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setBorrowerDetails(null)

    if (!validateMobile(mobile)) {
      setError("Please enter a valid 10-digit mobile number")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/borrower-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: mobile.replace(/\D/g, ""),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setBorrowerDetails(data)
      } else {
        setError(data.error || "Failed to fetch borrower details")
      }
    } catch (error) {
      console.error("Error fetching borrower details:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totalOutstanding = borrowerDetails?.lenders.reduce((sum, lender) => sum + lender.balance, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Search className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Borrower Lookup</h1>
          <p className="text-pink-100">Check your borrowing details</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Enter Your Mobile Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="123-456-7890"
                    value={mobile}
                    onChange={handleMobileChange}
                    className="pl-10"
                    maxLength={12}
                    required
                  />
                </div>
                {mobile && !validateMobile(mobile) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid 10-digit mobile number</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading || !validateMobile(mobile)}>
                {loading ? "Searching..." : "Check Borrowing Details"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Borrower Details */}
        {borrowerDetails && (
          <>
            {/* Borrower Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium">{borrowerDetails.borrower_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mobile</span>
                    <span className="font-medium">{formatMobileNumber(borrowerDetails.borrower_mobile)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Outstanding</span>
                    <span className="font-bold text-red-600">₹{totalOutstanding.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-medium">{borrowerDetails.total_transactions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lenders Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lenders Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {borrowerDetails.lenders.map((lender) => (
                  <div key={lender.lender_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{lender.lender_name}</p>
                        {lender.lender_mobile && (
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {formatMobileNumber(lender.lender_mobile)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">₹{lender.balance.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Outstanding</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Total Borrowed</p>
                        <p className="font-medium text-blue-600">₹{lender.total_borrowed.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">Total Repaid</p>
                        <p className="font-medium text-green-600">₹{lender.total_repaid.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Recent Transactions</p>
                      {lender.transactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1 rounded-full ${
                                transaction.type === "lend"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {transaction.type === "lend" ? (
                                <HandCoins className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </div>
                            <div>
                              <Badge
                                variant={transaction.type === "lend" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {transaction.type === "lend" ? "Borrowed" : "Repayment"}
                              </Badge>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(transaction.transaction_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p
                            className={`font-medium ${
                              transaction.type === "lend" ? "text-blue-600" : "text-green-600"
                            }`}
                          >
                            {transaction.type === "lend" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                      {lender.transactions.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{lender.transactions.length - 3} more transactions
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-blue-800 font-medium mb-2">Need to make a payment?</p>
                  <p className="text-xs text-blue-700">
                    Contact your lenders directly using the mobile numbers shown above to arrange repayment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Information Card */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-700 font-medium mb-2">How it works</p>
              <p className="text-xs text-gray-600">
                Enter your mobile number to see all money borrowed from CreditKeep users. This helps you track your
                borrowings and plan repayments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

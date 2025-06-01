"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Minus,
  Receipt,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Filter,
  Phone,
  MapPin,
} from "lucide-react"
import Link from "next/link"

interface Shop {
  id: number
  name: string
  description: string
  mobile: string
  address: string
  created_at: string
  total_balance: number
}

interface Transaction {
  id: number
  amount: number
  type: "borrow" | "payment"
  description: string
  transaction_date: string
  created_at: string
}

interface User {
  id: number
  name: string
  email: string
}

export default function ShopDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.slug as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [transactionType, setTransactionType] = useState<"borrow" | "payment">("borrow")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0])
  const [filterType, setFilterType] = useState<"all" | "borrow" | "payment">("all")

  useEffect(() => {
    if (shopId) {
      fetchShopData()
      fetchUser()
    }
  }, [shopId])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  }

  const fetchShopData = async () => {
    try {
      setLoading(true)
      const [shopResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/shops/${shopId}`),
        fetch(`/api/shops/${shopId}/transactions`),
      ])

      if (shopResponse.ok) {
        const shopData = await shopResponse.json()
        setShop(shopData.shop)
      } else if (shopResponse.status === 404) {
        router.push("/shops")
        return
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions)
      }
    } catch (error) {
      console.error("Error fetching shop data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingTransaction(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId: Number.parseInt(shopId),
          amount: Number.parseFloat(amount),
          type: transactionType,
          description,
          transactionDate,
        }),
      })

      if (response.ok) {
        setAmount("")
        setDescription("")
        setTransactionDate(new Date().toISOString().split("T")[0])
        await fetchShopData() // Refresh data
      } else {
        const data = await response.json()
        alert(data.error || "Failed to add transaction")
      }
    } catch (error) {
      console.error("Error adding transaction:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsAddingTransaction(false)
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

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterType === "all") return true
    return transaction.type === filterType
  })

  const totalBorrowed = transactions.filter((t) => t.type === "borrow").reduce((sum, t) => sum + Number(t.amount), 0)

  const totalPaid = transactions.filter((t) => t.type === "payment").reduce((sum, t) => sum + Number(t.amount), 0)

  const currentBalance = totalBorrowed - totalPaid

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Navbar showAuthButtons={true} userName={user?.name || "User"} />
        <div className="p-4 space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Navbar showAuthButtons={true} userName={user?.name || "User"} />
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Shop not found</h1>
          <Link href="/shops">
            <Button>Back to Shops</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Navbar showAuthButtons={true} userName={user?.name || "User"} />
      <AppLayout>
        <div className="p-4 space-y-6 pt-2">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/shops">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              {shop.description && <p className="text-gray-600 text-sm">{shop.description}</p>}

              {/* Contact Information */}
              <div className="flex flex-col gap-1 mt-2">
                {shop.mobile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{formatMobileNumber(shop.mobile)}</span>
                  </div>
                )}
                {shop.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{shop.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Balance Overview */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-1">Current Balance</p>
                <p className="text-4xl font-bold mb-2">₹{Math.abs(currentBalance).toFixed(2)}</p>
                <p className="text-blue-100 text-sm">
                  {currentBalance > 0 ? "You owe" : currentBalance < 0 ? "They owe you" : "All settled"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto text-red-600 mb-2" />
                <p className="text-sm text-gray-600">Total Borrowed</p>
                <p className="text-lg font-bold text-red-600">₹{totalBorrowed.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingDown className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-lg font-bold text-green-600">₹{totalPaid.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="h-16 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => setTransactionType("borrow")}
                >
                  <div className="flex flex-col items-center">
                    <Plus className="h-5 w-5 mb-1" />
                    <span className="text-sm">Borrow Money</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-red-600" />
                    Borrow from {shop.name}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div>
                    <Label htmlFor="borrow-amount">Amount (₹)</Label>
                    <Input
                      id="borrow-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="borrow-date">Date</Label>
                    <Input
                      id="borrow-date"
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="borrow-description">Description (Optional)</Label>
                    <Textarea
                      id="borrow-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What did you borrow for?"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isAddingTransaction || !amount}
                  >
                    {isAddingTransaction ? "Adding..." : "Add Borrowing"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="h-16 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => setTransactionType("payment")}
                >
                  <div className="flex flex-col items-center">
                    <Minus className="h-5 w-5 mb-1" />
                    <span className="text-sm">Make Payment</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Minus className="h-5 w-5 text-green-600" />
                    Pay to {shop.name}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div>
                    <Label htmlFor="payment-amount">Amount (₹)</Label>
                    <Input
                      id="payment-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-date">Date</Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-description">Description (Optional)</Label>
                    <Textarea
                      id="payment-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Payment details..."
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isAddingTransaction || !amount}
                  >
                    {isAddingTransaction ? "Processing..." : "Make Payment"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Transactions
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as "all" | "borrow" | "payment")}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">All</option>
                    <option value="borrow">Borrowed</option>
                    <option value="payment">Payments</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {filterType === "all" ? "No transactions yet" : `No ${filterType} transactions`}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Start by adding a borrowing or payment above</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "borrow" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        }`}
                      >
                        {transaction.type === "borrow" ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={transaction.type === "borrow" ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {transaction.type === "borrow" ? "Borrowed" : "Payment"}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </span>
                        </div>
                        {transaction.description && <p className="text-sm text-gray-600">{transaction.description}</p>}
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(transaction.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === "borrow" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {transaction.type === "borrow" ? "+" : "-"}₹{Number(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Shop Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">{new Date(shop.created_at).toLocaleDateString()}</span>
              </div>
              {shop.mobile && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile</span>
                  <span className="font-medium">{formatMobileNumber(shop.mobile)}</span>
                </div>
              )}
              {shop.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address</span>
                  <span className="font-medium text-right">{shop.address}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-medium">{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Activity</span>
                <span className="font-medium">
                  {transactions.length > 0 ? new Date(transactions[0].created_at).toLocaleDateString() : "No activity"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </div>
  )
}

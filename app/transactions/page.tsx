"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Receipt,
  Search,
  Filter,
  Calendar,
  Clock,
  Plus,
  Minus,
  ArrowUpDown,
  Download,
  Store,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: number
  amount: number
  type: "borrow" | "payment"
  description: string
  transaction_date: string
  created_at: string
  shop_name: string
  shop_id: number
}

interface User {
  id: number
  name: string
  email: string
}

interface Shop {
  id: number
  name: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedShop, setSelectedShop] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "shop">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dateRange, setDateRange] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAndSortTransactions()
  }, [transactions, searchTerm, selectedShop, selectedType, sortBy, sortOrder, dateRange])

  const fetchData = async () => {
    try {
      const [userResponse, transactionsResponse, shopsResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/transactions?limit=1000"), // Get all transactions
        fetch("/api/shops"),
      ])

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions)
      }

      if (shopsResponse.ok) {
        const shopsData = await shopsResponse.json()
        setShops(shopsData.shops)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortTransactions = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Shop filter
    if (selectedShop !== "all") {
      filtered = filtered.filter((transaction) => transaction.shop_id.toString() === selectedShop)
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === selectedType)
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date()
      const startDate = new Date()

      switch (dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
        case "3months":
          startDate.setMonth(now.getMonth() - 3)
          break
        case "year":
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      if (dateRange !== "all") {
        filtered = filtered.filter((transaction) => new Date(transaction.transaction_date) >= startDate)
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
          break
        case "amount":
          comparison = Number(a.amount) - Number(b.amount)
          break
        case "shop":
          comparison = a.shop_name.localeCompare(b.shop_name)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredTransactions(filtered)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedShop("all")
    setSelectedType("all")
    setDateRange("all")
    setSortBy("date")
    setSortOrder("desc")
  }

  const exportTransactions = () => {
    const csvContent = [
      ["Date", "Shop", "Type", "Amount", "Description"],
      ...filteredTransactions.map((t) => [
        new Date(t.transaction_date).toLocaleDateString(),
        t.shop_name,
        t.type,
        t.amount.toString(),
        t.description || "",
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calculate statistics
  const totalBorrowed = filteredTransactions
    .filter((t) => t.type === "borrow")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalPaid = filteredTransactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netBalance = totalBorrowed - totalPaid

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Navbar showAuthButtons={true} userName={user?.name || "User"} />
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
        <div className="p-4 space-y-6 pt-2">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
              <p className="text-gray-600">{filteredTransactions.length} transactions</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportTransactions} className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                Export
              </Button>
              <Link href="/transactions/add">
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-red-600 mb-1" />
                <p className="text-xs text-gray-600">Borrowed</p>
                <p className="text-sm font-bold text-red-600">₹{totalBorrowed.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <TrendingDown className="h-4 w-4 mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-600">Paid</p>
                <p className="text-sm font-bold text-green-600">₹{totalPaid.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <DollarSign className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-gray-600">Net</p>
                <p className={`text-sm font-bold ${netBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                  ₹{Math.abs(netBalance).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Row 1 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Shop</label>
                  <Select value={selectedShop} onValueChange={setSelectedShop}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shops</SelectItem>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id.toString()}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="borrow">Borrowed</SelectItem>
                      <SelectItem value="payment">Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Row 2 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Period</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Sort By</label>
                  <div className="flex gap-1">
                    <Select value={sortBy} onValueChange={(value: "date" | "amount" | "shop") => setSortBy(value)}>
                      <SelectTrigger className="h-9 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={toggleSortOrder} className="h-9 px-2">
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                  Clear All Filters
                </Button>
                <span className="text-xs text-gray-500">
                  {filteredTransactions.length} of {transactions.length} transactions
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No transactions found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {transactions.length === 0
                      ? "Start by adding your first transaction"
                      : "Try adjusting your filters"}
                  </p>
                  {transactions.length === 0 && (
                    <Link href="/transactions/add" className="mt-4 inline-block">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Transaction
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "borrow" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                          }`}
                        >
                          {transaction.type === "borrow" ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/shops/${transaction.shop_id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate"
                            >
                              {transaction.shop_name}
                            </Link>
                            <Badge
                              variant={transaction.type === "borrow" ? "destructive" : "default"}
                              className="text-xs flex-shrink-0"
                            >
                              {transaction.type === "borrow" ? "Borrowed" : "Payment"}
                            </Badge>
                          </div>
                          {transaction.description && (
                            <p className="text-sm text-gray-600 truncate">{transaction.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(transaction.transaction_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(transaction.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-lg font-bold ${
                            transaction.type === "borrow" ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {transaction.type === "borrow" ? "+" : "-"}₹{Number(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary by Shop */}
          {filteredTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Summary by Shop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shops
                    .map((shop) => {
                      const shopTransactions = filteredTransactions.filter((t) => t.shop_id === shop.id)
                      if (shopTransactions.length === 0) return null

                      const borrowed = shopTransactions
                        .filter((t) => t.type === "borrow")
                        .reduce((sum, t) => sum + Number(t.amount), 0)
                      const paid = shopTransactions
                        .filter((t) => t.type === "payment")
                        .reduce((sum, t) => sum + Number(t.amount), 0)
                      const balance = borrowed - paid

                      return (
                        <div key={shop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <Link
                              href={`/shops/${shop.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {shop.name}
                            </Link>
                            <p className="text-xs text-gray-600">{shopTransactions.length} transactions</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                              ₹{Math.abs(balance).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {balance > 0 ? "You owe" : balance < 0 ? "They owe" : "Settled"}
                            </p>
                          </div>
                        </div>
                      )
                    })
                    .filter(Boolean)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </div>
  )
}

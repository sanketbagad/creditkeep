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
  ChevronRight,
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
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs text-red-700 font-medium">Borrowed</p>
                <p className="text-lg font-bold text-red-800">₹{totalBorrowed.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs text-green-700 font-medium">Paid</p>
                <p className="text-lg font-bold text-green-800">₹{totalPaid.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
              <CardContent className="p-3 text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs text-blue-700 font-medium">Net</p>
                <p className={`text-lg font-bold ${netBalance > 0 ? "text-red-800" : "text-green-800"}`}>
                  ₹{Math.abs(netBalance).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
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
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Filter Row 1 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Shop</label>
                  <Select value={selectedShop} onValueChange={setSelectedShop}>
                    <SelectTrigger className="h-9 border-gray-300">
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
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-9 border-gray-300">
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
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Period</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="h-9 border-gray-300">
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
                  <label className="text-xs text-gray-600 mb-1 block font-medium">Sort By</label>
                  <div className="flex gap-1">
                    <Select value={sortBy} onValueChange={(value: "date" | "amount" | "shop") => setSortBy(value)}>
                      <SelectTrigger className="h-9 flex-1 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={toggleSortOrder} className="h-9 px-2 border-gray-300">
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear All Filters
                </Button>
                <span className="text-xs text-gray-500">
                  {filteredTransactions.length} of {transactions.length} transactions
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ultra Modern Transactions List */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-white" />
                </div>
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Receipt className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg">No transactions found</p>
                  <p className="text-sm text-gray-400 mt-2 mb-6">
                    {transactions.length === 0
                      ? "Start by adding your first transaction"
                      : "Try adjusting your filters"}
                  </p>
                  {transactions.length === 0 && (
                    <Link href="/transactions/add">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {/* Gradient Background Overlay */}
                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
                          transaction.type === "borrow"
                            ? "bg-gradient-to-br from-red-500 to-pink-500"
                            : "bg-gradient-to-br from-green-500 to-emerald-500"
                        }`}
                      />

                      {/* Top Status Bar */}
                      <div
                        className={`h-1 w-full ${
                          transaction.type === "borrow"
                            ? "bg-gradient-to-r from-red-400 via-red-500 to-red-600"
                            : "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                        }`}
                      />

                      <div className="p-4">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Transaction Icon */}
                            <div
                              className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                transaction.type === "borrow"
                                  ? "bg-gradient-to-br from-red-500 to-red-600"
                                  : "bg-gradient-to-br from-green-500 to-green-600"
                              }`}
                            >
                              {transaction.type === "borrow" ? (
                                <Plus className="h-5 w-5 text-white" />
                              ) : (
                                <Minus className="h-5 w-5 text-white" />
                              )}
                              {/* Pulse effect */}
                              <div
                                className={`absolute inset-0 rounded-xl animate-pulse opacity-20 ${
                                  transaction.type === "borrow" ? "bg-red-400" : "bg-green-400"
                                }`}
                              />
                            </div>

                            {/* Shop Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Link
                                  href={`/shops/${transaction.shop_id}`}
                                  className="font-bold text-gray-900 hover:text-blue-600 transition-colors truncate text-lg group-hover:text-blue-600"
                                  title={transaction.shop_name}
                                >
                                  {transaction.shop_name}
                                </Link>
                                <Badge
                                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 ${
                                    transaction.type === "borrow"
                                      ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                                      : "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                                  }`}
                                >
                                  {transaction.type === "borrow" ? "BORROWED" : "PAID"}
                                </Badge>
                              </div>

                              {/* Date Row */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(transaction.transaction_date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  {new Date(transaction.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Amount - Prominent Display */}
                          <div className="text-right flex-shrink-0 ml-3">
                            <div
                              className={`text-2xl font-black ${
                                transaction.type === "borrow" ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {transaction.type === "borrow" ? "+" : "-"}₹
                              {Number(transaction.amount).toLocaleString("en-IN")}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-1">
                              {transaction.type === "borrow" ? "BORROWED" : "PAYMENT"}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {transaction.description && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 italic">
                              "{transaction.description}"
                            </p>
                          </div>
                        )}

                        {/* Action Indicator */}
                        <div className="absolute top-4 right-4">
                          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Summary by Shop */}
          {filteredTransactions.length > 0 && (
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Store className="h-4 w-4 text-white" />
                  </div>
                  Shop Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                        <div
                          key={shop.id}
                          className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {/* Gradient Background */}
                          <div
                            className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
                              balance > 0
                                ? "bg-gradient-to-br from-red-500 to-pink-500"
                                : balance < 0
                                  ? "bg-gradient-to-br from-green-500 to-emerald-500"
                                  : "bg-gradient-to-br from-blue-500 to-purple-500"
                            }`}
                          />

                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Shop Icon */}
                                <div
                                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                                    balance > 0
                                      ? "bg-gradient-to-br from-red-500 to-red-600"
                                      : balance < 0
                                        ? "bg-gradient-to-br from-green-500 to-green-600"
                                        : "bg-gradient-to-br from-blue-500 to-blue-600"
                                  }`}
                                >
                                  <Store className="h-6 w-6 text-white" />
                                </div>

                                {/* Shop Details */}
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/shops/${shop.id}`}
                                    className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors block truncate group-hover:text-blue-600"
                                    title={shop.name}
                                  >
                                    {shop.name}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                                      {shopTransactions.length} transactions
                                    </span>
                                    <span
                                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        balance > 0
                                          ? "bg-red-100 text-red-700"
                                          : balance < 0
                                            ? "bg-green-100 text-green-700"
                                            : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {balance > 0 ? "YOU OWE" : balance < 0 ? "THEY OWE" : "SETTLED"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Balance Amount */}
                              <div className="text-right flex-shrink-0 ml-4">
                                <div
                                  className={`text-2xl font-black ${
                                    balance > 0 ? "text-red-600" : balance < 0 ? "text-green-600" : "text-blue-600"
                                  }`}
                                >
                                  ₹{Math.abs(balance).toLocaleString("en-IN")}
                                </div>
                                <div className="text-xs text-gray-500 font-medium mt-1">BALANCE</div>
                              </div>
                            </div>
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

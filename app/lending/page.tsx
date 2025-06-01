"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  HandCoins,
  Plus,
  Minus,
  Phone,
  User,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  Search,
} from "lucide-react"

interface LendTransaction {
  id: number
  amount: number
  type: "lend" | "repayment"
  description: string
  transaction_date: string
  created_at: string
  borrower_name: string
  borrower_mobile: string
}

interface UserProfile {
  id: number
  name: string
  email: string
}

export default function LendingPage() {
  const [transactions, setTransactions] = useState<LendTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<LendTransaction[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form fields
  const [borrowerName, setBorrowerName] = useState("")
  const [borrowerMobile, setBorrowerMobile] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"lend" | "repayment">("lend")
  const [description, setDescription] = useState("")
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0])

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, selectedType])

  const fetchData = async () => {
    try {
      const [userResponse, transactionsResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/lend-transactions"),
      ])

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.borrower_mobile.includes(searchTerm) ||
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === selectedType)
    }

    setFilteredTransactions(filtered)
  }

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
    setBorrowerMobile(formatted)
  }

  const validateMobile = (mobile: string) => {
    const digits = mobile.replace(/\D/g, "")
    return digits.length === 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    if (!validateMobile(borrowerMobile)) {
      alert("Please enter a valid 10-digit mobile number")
      setCreating(false)
      return
    }

    try {
      const response = await fetch("/api/lend-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowerName,
          borrowerMobile: borrowerMobile.replace(/\D/g, ""),
          amount: Number.parseFloat(amount),
          type,
          description,
          transactionDate,
        }),
      })

      if (response.ok) {
        setBorrowerName("")
        setBorrowerMobile("")
        setAmount("")
        setDescription("")
        setTransactionDate(new Date().toISOString().split("T")[0])
        setIsDialogOpen(false)
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to add transaction")
      }
    } catch (error) {
      console.error("Error adding transaction:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  // Calculate statistics
  const totalLent = filteredTransactions.filter((t) => t.type === "lend").reduce((sum, t) => sum + Number(t.amount), 0)

  const totalRepaid = filteredTransactions
    .filter((t) => t.type === "repayment")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netLent = totalLent - totalRepaid

  // Group by borrower
  const borrowerSummary = filteredTransactions.reduce((acc, transaction) => {
    const key = transaction.borrower_mobile
    if (!acc[key]) {
      acc[key] = {
        borrower_name: transaction.borrower_name,
        borrower_mobile: transaction.borrower_mobile,
        total_lent: 0,
        total_repaid: 0,
        balance: 0,
        transaction_count: 0,
      }
    }

    const amount = Number(transaction.amount)
    if (transaction.type === "lend") {
      acc[key].total_lent += amount
    } else {
      acc[key].total_repaid += amount
    }

    acc[key].balance = acc[key].total_lent - acc[key].total_repaid
    acc[key].transaction_count++

    return acc
  }, {} as any)

  const borrowers = Object.values(borrowerSummary).filter((b: any) => b.balance > 0)

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
              <h1 className="text-2xl font-bold text-gray-900">Lending</h1>
              <p className="text-gray-600">Money you've lent to others</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Lending Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Transaction Type Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={type === "lend" ? "default" : "outline"}
                      onClick={() => setType("lend")}
                      className="h-12 flex flex-col items-center"
                    >
                      <HandCoins className="h-4 w-4 mb-1" />
                      <span className="text-xs">Lend Money</span>
                    </Button>
                    <Button
                      type="button"
                      variant={type === "repayment" ? "default" : "outline"}
                      onClick={() => setType("repayment")}
                      className="h-12 flex flex-col items-center"
                    >
                      <Minus className="h-4 w-4 mb-1" />
                      <span className="text-xs">Repayment</span>
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="borrower-name">Borrower Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="borrower-name"
                        value={borrowerName}
                        onChange={(e) => setBorrowerName(e.target.value)}
                        placeholder="Enter borrower's name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="borrower-mobile">Borrower Mobile</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="borrower-mobile"
                        type="tel"
                        placeholder="123-456-7890"
                        value={borrowerMobile}
                        onChange={handleMobileChange}
                        className="pl-10"
                        maxLength={12}
                        required
                      />
                    </div>
                    {borrowerMobile && !validateMobile(borrowerMobile) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid 10-digit mobile number</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
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
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a note about this transaction"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating} className="flex-1">
                      {creating ? "Adding..." : `Add ${type === "lend" ? "Lending" : "Repayment"}`}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                <p className="text-xs text-gray-600">Total Lent</p>
                <p className="text-sm font-bold text-blue-600">₹{totalLent.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <TrendingDown className="h-4 w-4 mx-auto text-green-600 mb-1" />
                <p className="text-xs text-gray-600">Repaid</p>
                <p className="text-sm font-bold text-green-600">₹{totalRepaid.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <DollarSign className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                <p className="text-xs text-gray-600">Outstanding</p>
                <p className="text-sm font-bold text-orange-600">₹{netLent.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Outstanding Borrowers */}
          {borrowers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outstanding Borrowers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {borrowers.map((borrower: any) => (
                  <div
                    key={borrower.borrower_mobile}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{borrower.borrower_name}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {formatMobileNumber(borrower.borrower_mobile)}
                      </p>
                      <p className="text-xs text-gray-500">{borrower.transaction_count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">₹{borrower.balance.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Outstanding</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, mobile, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="lend">Lent Money</SelectItem>
                    <SelectItem value="repayment">Repayments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <HandCoins className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No lending transactions found</p>
                  <p className="text-sm text-gray-400 mt-1">Start by lending money to someone</p>
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
                            transaction.type === "lend" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
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
                            <p className="font-medium text-gray-900 truncate">{transaction.borrower_name}</p>
                            <Badge
                              variant={transaction.type === "lend" ? "default" : "secondary"}
                              className="text-xs flex-shrink-0"
                            >
                              {transaction.type === "lend" ? "Lent" : "Repayment"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {formatMobileNumber(transaction.borrower_mobile)}
                          </p>
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
                            transaction.type === "lend" ? "text-blue-600" : "text-green-600"
                          }`}
                        >
                          {transaction.type === "lend" ? "+" : "-"}₹{Number(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </div>
  )
}

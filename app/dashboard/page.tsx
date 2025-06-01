"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Store, Receipt, Plus } from "lucide-react"
import Link from "next/link"

interface Shop {
  id: number
  name: string
  total_balance: number
}

interface Transaction {
  id: number
  amount: number
  type: "borrow" | "payment"
  shop_name: string
  transaction_date: string
}

interface User {
  id: number
  name: string
  email: string
}

export default function DashboardPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get user info from cookie or session
      const userResponse = await fetch("/api/auth/me")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      } else {
        // Default to demo user if not logged in
        setUser({ id: 1, name: "Demo User", email: "demo@example.com" })
      }

      const [shopsRes, transactionsRes] = await Promise.all([fetch("/api/shops"), fetch("/api/transactions?limit=5")])

      const shopsData = await shopsRes.json()
      const transactionsData = await transactionsRes.json()

      if (shopsRes.ok) {
        setShops(shopsData.shops)
        const total = shopsData.shops.reduce(
          (sum: number, shop: Shop) => sum + Number.parseFloat(shop.total_balance.toString()),
          0,
        )
        setTotalBalance(total)
      }

      if (transactionsRes.ok) {
        setTransactions(transactionsData.transactions)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
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
        <div className="p-4 space-y-6 pt-2">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name.split(" ")[0] || "User"}</p>
            </div>
            <Link href="/transactions/add">
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </Link>
          </div>

          {/* Total Balance Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm">Total Balance</p>
                  <p className="text-3xl font-bold">₹{totalBalance.toFixed(2)}</p>
                  <p className="text-blue-100 text-sm mt-1">{totalBalance > 0 ? "Amount you owe" : "All clear!"}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/shops">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Store className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="font-medium">Shops</p>
                  <p className="text-sm text-gray-600">{shops.length} total</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/analytics">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <ArrowUpRight className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-gray-600">View trends</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Link href="/transactions" className="text-blue-600 text-sm">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "borrow" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        }`}
                      >
                        {transaction.type === "borrow" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.shop_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.type === "borrow" ? "text-red-600" : "text-green-600"}`}>
                        {transaction.type === "borrow" ? "+" : "-"}₹{transaction.amount}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </div>
  )
}

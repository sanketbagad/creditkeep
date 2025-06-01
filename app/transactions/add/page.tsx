"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Minus } from "lucide-react"
import Link from "next/link"

interface Shop {
  id: number
  name: string
}

export default function AddTransactionPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShopId, setSelectedShopId] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"borrow" | "payment">("borrow")
  const [description, setDescription] = useState("")
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchShops()
  }, [])

  const fetchShops = async () => {
    try {
      const response = await fetch("/api/shops")
      const data = await response.json()

      if (response.ok) {
        setShops(data.shops)
      }
    } catch (error) {
      console.error("Error fetching shops:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId: Number.parseInt(selectedShopId),
          amount: Number.parseFloat(amount),
          type,
          description,
          transactionDate,
        }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add transaction")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
            <p className="text-gray-600">Record a borrowing or payment</p>
          </div>
        </div>

        {/* Transaction Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={type === "borrow" ? "default" : "outline"}
            onClick={() => setType("borrow")}
            className="h-16 flex flex-col items-center"
          >
            <Plus className="h-5 w-5 mb-1" />
            <span className="text-sm">Borrow Money</span>
          </Button>
          <Button
            variant={type === "payment" ? "default" : "outline"}
            onClick={() => setType("payment")}
            className="h-16 flex flex-col items-center"
          >
            <Minus className="h-5 w-5 mb-1" />
            <span className="text-sm">Make Payment</span>
          </Button>
        </div>

        {/* Transaction Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{type === "borrow" ? "Borrowing Details" : "Payment Details"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

              <div>
                <Label htmlFor="shop">Shop</Label>
                <Select value={selectedShopId} onValueChange={setSelectedShopId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id.toString()}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shops.length === 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    <Link href="/shops" className="text-blue-600 hover:underline">
                      Create a shop first
                    </Link>
                  </p>
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

              <Button type="submit" className="w-full" disabled={loading || !selectedShopId || !amount}>
                {loading ? "Adding..." : `Add ${type === "borrow" ? "Borrowing" : "Payment"}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

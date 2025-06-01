"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Store } from "lucide-react"

interface Shop {
  id: number
  name: string
  description: string
  total_balance: number
  created_at: string
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newShopName, setNewShopName] = useState("")
  const [newShopDescription, setNewShopDescription] = useState("")
  const [creating, setCreating] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newShopName,
          description: newShopDescription,
        }),
      })

      if (response.ok) {
        setNewShopName("")
        setNewShopDescription("")
        setIsDialogOpen(false)
        fetchShops()
      }
    } catch (error) {
      console.error("Error creating shop:", error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
            <p className="text-gray-600">Manage your shops</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Shop
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4">
              <DialogHeader>
                <DialogTitle>Add New Shop</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateShop} className="space-y-4">
                <div>
                  <Label htmlFor="shop-name">Shop Name</Label>
                  <Input
                    id="shop-name"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="Enter shop name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shop-description">Description (Optional)</Label>
                  <Textarea
                    id="shop-description"
                    value={newShopDescription}
                    onChange={(e) => setNewShopDescription(e.target.value)}
                    placeholder="Enter shop description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating} className="flex-1">
                    {creating ? "Creating..." : "Create Shop"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Shops List */}
        <div className="space-y-4">
          {shops.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shops yet</h3>
                <p className="text-gray-600 mb-4">Create your first shop to start tracking borrowings</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Shop
                </Button>
              </CardContent>
            </Card>
          ) : (
            shops.map((shop) => (
              <Card key={shop.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Store className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{shop.name}</h3>
                        {shop.description && <p className="text-sm text-gray-600">{shop.description}</p>}
                        <p className="text-xs text-gray-500">
                          Created {new Date(shop.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          Number.parseFloat(shop.total_balance.toString()) > 0 ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        ₹{Math.abs(Number.parseFloat(shop.total_balance.toString())).toFixed(2)}
                      </p>
                      {Number.parseFloat(shop.total_balance.toString()) > 0 && (
                        <p className="text-xs text-red-500">You owe</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Store, ArrowRight, Phone, MapPin } from "lucide-react"
import Link from "next/link"

interface Shop {
  id: number
  name: string
  description: string
  mobile: string
  address: string
  total_balance: number
  created_at: string
}

interface User {
  id: number
  name: string
  email: string
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newShopName, setNewShopName] = useState("")
  const [newShopDescription, setNewShopDescription] = useState("")
  const [newShopMobile, setNewShopMobile] = useState("")
  const [newShopAddress, setNewShopAddress] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchShops()
    fetchUser()
  }, [])

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
    setNewShopMobile(formatted)
  }

  const validateMobile = (mobile: string) => {
    const digits = mobile.replace(/\D/g, "")
    return digits.length === 10
  }

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    // Validate mobile number if provided
    if (newShopMobile && !validateMobile(newShopMobile)) {
      alert("Please enter a valid 10-digit mobile number")
      setCreating(false)
      return
    }

    try {
      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newShopName,
          description: newShopDescription,
          mobile: newShopMobile.replace(/\D/g, ""), // Send only digits
          address: newShopAddress,
        }),
      })

      if (response.ok) {
        setNewShopName("")
        setNewShopDescription("")
        setNewShopMobile("")
        setNewShopAddress("")
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
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Navbar showAuthButtons={true} userName={user?.name || "User"} />
        <div className="p-4 space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
              <p className="text-gray-600">Manage your shops</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Shop
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-h-[90vh] overflow-y-auto">
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
                    <Label htmlFor="shop-mobile">
                      Mobile Number <span className="text-gray-500 text-sm">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="shop-mobile"
                        type="tel"
                        placeholder="123-456-7890"
                        value={newShopMobile}
                        onChange={handleMobileChange}
                        className="pl-10"
                        maxLength={12}
                      />
                    </div>
                    {newShopMobile && !validateMobile(newShopMobile) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid 10-digit mobile number</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="shop-address">
                      Address <span className="text-gray-500 text-sm">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="shop-address"
                        value={newShopAddress}
                        onChange={(e) => setNewShopAddress(e.target.value)}
                        placeholder="Enter shop address"
                        rows={2}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shop-description">
                      Description <span className="text-gray-500 text-sm">(Optional)</span>
                    </Label>
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
                <Link key={shop.id} href={`/shops/${shop.id}`}>
                  <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Store className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{shop.name}</h3>
                            {shop.description && <p className="text-sm text-gray-600">{shop.description}</p>}

                            {/* Contact Info */}
                            <div className="flex flex-col gap-1 mt-1">
                              {shop.mobile && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Phone className="h-3 w-3" />
                                  <span>{formatMobileNumber(shop.mobile)}</span>
                                </div>
                              )}
                              {shop.address && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{shop.address}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              Created {new Date(shop.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
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
                            {Number.parseFloat(shop.total_balance.toString()) < 0 && (
                              <p className="text-xs text-green-500">They owe</p>
                            )}
                            {Number.parseFloat(shop.total_balance.toString()) === 0 && (
                              <p className="text-xs text-gray-500">Settled</p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>

          {/* Summary Stats */}
          {shops.length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Outstanding</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹
                      {shops
                        .reduce((sum, shop) => {
                          const balance = Number.parseFloat(shop.total_balance.toString())
                          return sum + (balance > 0 ? balance : 0)
                        }, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Active Shops</p>
                    <p className="text-2xl font-bold text-purple-600">{shops.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </div>
  )
}

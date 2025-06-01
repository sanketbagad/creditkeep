"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ArrowLeft, MapPin, Phone, Save, Store, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Shop {
  id: number
  name: string
  description: string | null
  mobile: string | null
  address: string | null
}

interface User {
  id: number
  name: string
}

export default function EditShopPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.slug as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Form fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [mobile, setMobile] = useState("")
  const [address, setAddress] = useState("")

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
      const response = await fetch(`/api/shops/${shopId}`)

      if (response.ok) {
        const data = await response.json()
        setShop(data.shop)

        // Initialize form fields
        setName(data.shop.name || "")
        setDescription(data.shop.description || "")
        setMobile(data.shop.mobile ? formatMobileNumber(data.shop.mobile) : "")
        setAddress(data.shop.address || "")
      } else if (response.status === 404) {
        router.push("/shops")
        return
      }
    } catch (error) {
      console.error("Error fetching shop data:", error)
      setError("Failed to load shop data")
    } finally {
      setLoading(false)
    }
  }

  const formatMobileNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10)

    // Format as XXX-XXX-XXXX
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
    if (!mobile) return true // Mobile is optional
    const digits = mobile.replace(/\D/g, "")
    return digits.length === 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validate form
    if (!name.trim()) {
      setError("Shop name is required")
      return
    }

    if (!validateMobile(mobile)) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          mobile: mobile ? mobile.replace(/\D/g, "") : null,
          address: address || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)

        // Update shop data
        setShop({
          ...shop!,
          name,
          description: description || null,
          mobile: mobile ? mobile.replace(/\D/g, "") : null,
          address: address || null,
        })

        // Show success message for 3 seconds
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        setError(data.error || "Failed to update shop")
      }
    } catch (error) {
      console.error("Error updating shop:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteShop = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/shops")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete shop")
        setDeleting(false)
      }
    } catch (error) {
      console.error("Error deleting shop:", error)
      setError("Something went wrong. Please try again.")
      setDeleting(false)
    }
  }

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
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href={`/shops/${shopId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Shop</h1>
              <p className="text-gray-600">Update shop information</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-4 rounded-xl border border-green-200">
                    <Save className="h-4 w-4 flex-shrink-0" />
                    Shop updated successfully!
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter shop name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">
                    Mobile Number <span className="text-gray-500 text-sm">(Optional)</span>
                  </Label>
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
                    />
                  </div>
                  {mobile && !validateMobile(mobile) && (
                    <p className="text-xs text-red-500">Please enter a valid 10-digit mobile number</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Address <span className="text-gray-500 text-sm">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter shop address"
                      rows={2}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-gray-500 text-sm">(Optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter shop description"
                    rows={3}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" className="flex items-center gap-1">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="mx-4">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the shop and all its transactions. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteShop}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={deleting}
                        >
                          {deleting ? "Deleting..." : "Delete Shop"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, X, Receipt, TrendingUp, TrendingDown, HandCoins } from "lucide-react"
import { cn } from "@/lib/utils"

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-24 right-4 z-40">
      {/* Sub-actions */}
      <div
        className={cn(
          "flex flex-col gap-3 mb-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <Link href="/lending">
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg rounded-full h-12 w-12 p-0"
            onClick={() => setIsOpen(false)}
          >
            <HandCoins className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/transactions/add?type=payment">
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white shadow-lg rounded-full h-12 w-12 p-0"
            onClick={() => setIsOpen(false)}
          >
            <TrendingDown className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/transactions/add?type=borrow">
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white shadow-lg rounded-full h-12 w-12 p-0"
            onClick={() => setIsOpen(false)}
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/transactions">
          <Button
            size="sm"
            variant="outline"
            className="bg-white shadow-lg rounded-full h-12 w-12 p-0"
            onClick={() => setIsOpen(false)}
          >
            <Receipt className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full h-14 w-14 p-0 transition-transform duration-300",
          isOpen && "rotate-45",
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  )
}

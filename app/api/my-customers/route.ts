import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

// ...existing code...

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // 1. Get current user's mobile number
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, mobile: true },
    })

    if (!currentUser?.mobile) {
      return NextResponse.json({ error: "User mobile not found" }, { status: 400 })
    }

    // 2. Get all shops owned by current user
    const userShops = await prisma.shop.findMany({
      where: { userId: decoded.userId },
      select: { id: true, name: true },
    })

    if (userShops.length === 0) {
      return NextResponse.json({
        customers: [],
        summary: {
          total_customers: 0,
          total_outstanding: 0,
          total_borrowed: 0,
          total_paid: 0,
        },
      })
    }

    const shopIds = userShops.map((shop) => shop.id)

    // 3. Find all transactions where someone borrowed from my shop(s)
    const transactions = await prisma.transaction.findMany({
      where: {
        shopId: { in: shopIds },
        type: "borrow",
      },
      include: {
        user: {
          select: { id: true, name: true, mobile: true },
        },
      },
    })

    // 4. Group by borrower mobile
    const borrowersMap: Record<string, { name: string; mobile: string; total_borrowed: number }> = {}

    for (const tx of transactions) {
      const mobile = tx.user.mobile || "Unknown"
      if (!borrowersMap[mobile]) {
        borrowersMap[mobile] = {
          name: tx.user.name,
          mobile,
          total_borrowed: 0,
        }
      }
      borrowersMap[mobile].total_borrowed += Number(tx.amount)
    }

    const borrowers = Object.values(borrowersMap)

    return NextResponse.json({
      borrowers,
      my_mobile: currentUser.mobile,
    })
  } catch (error) {
    console.error("Error fetching borrowers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
// ...existing code...

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const shopId = Number.parseInt(params.id)
    if (isNaN(shopId)) {
      return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 })
    }

    // Verify shop belongs to user
    const shop = await prisma.shop.findFirst({
      where: {
        id: shopId,
        userId: decoded.userId,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    // Get transactions for this shop
    const transactions = await prisma.transaction.findMany({
      where: {
        shopId: shopId,
        userId: decoded.userId,
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    })

    // Format transactions for frontend
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type,
      description: transaction.description,
      transaction_date: transaction.transactionDate,
      created_at: transaction.createdAt,
    }))

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error) {
    console.error("Error fetching shop transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const transactions = await prisma.transaction.findMany({
      where: { userId: decoded.userId },
      include: {
        shop: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      take: limit,
    })

    // Format transactions for frontend
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type,
      description: transaction.description,
      transaction_date: transaction.transactionDate,
      created_at: transaction.createdAt,
      shop_name: transaction.shop.name,
      shop_id: transaction.shop.id,
    }))

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { shopId, amount, type, description, transactionDate } = await request.json()

    if (!shopId || !amount || !type) {
      return NextResponse.json({ error: "Shop, amount, and type are required" }, { status: 400 })
    }

    if (!["borrow", "payment"].includes(type)) {
      return NextResponse.json({ error: "Type must be either borrow or payment" }, { status: 400 })
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

    const transaction = await prisma.transaction.create({
      data: {
        userId: decoded.userId,
        shopId,
        amount,
        type,
        description: description || "",
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      },
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

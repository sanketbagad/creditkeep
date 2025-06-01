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

    // Get shops with transaction balances using Prisma
    const shops = await prisma.shop.findMany({
      where: { userId: decoded.userId },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate total balance for each shop
    const shopsWithBalance = shops.map((shop) => {
      const totalBalance = shop.transactions.reduce((sum, transaction) => {
        const amount = Number(transaction.amount)
        return transaction.type === "borrow" ? sum + amount : sum - amount
      }, 0)

      return {
        id: shop.id,
        name: shop.name,
        description: shop.description,
        created_at: shop.createdAt,
        total_balance: totalBalance,
      }
    })

    return NextResponse.json({ shops: shopsWithBalance })
  } catch (error) {
    console.error("Error fetching shops:", error)
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

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Shop name is required" }, { status: 400 })
    }

    const shop = await prisma.shop.create({
      data: {
        userId: decoded.userId,
        name,
        description: description || "",
      },
    })

    return NextResponse.json({ shop })
  } catch (error) {
    console.error("Error creating shop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

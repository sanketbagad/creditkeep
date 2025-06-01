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

    // Get total balance
    const transactions = await prisma.transaction.findMany({
      where: { userId: decoded.userId },
      select: {
        amount: true,
        type: true,
      },
    })

    const totalBalance = transactions.reduce((sum, transaction) => {
      const amount = Number(transaction.amount)
      return transaction.type === "borrow" ? sum + amount : sum - amount
    }, 0)

    // Get monthly spending (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId: decoded.userId,
        transactionDate: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        amount: true,
        type: true,
        transactionDate: true,
      },
      orderBy: { transactionDate: "desc" },
    })

    // Group by month
    const monthlySpending = monthlyTransactions.reduce(
      (acc, transaction) => {
        const month = transaction.transactionDate.toISOString().slice(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { month, borrowed: 0, paid: 0 }
        }

        const amount = Number(transaction.amount)
        if (transaction.type === "borrow") {
          acc[month].borrowed += amount
        } else {
          acc[month].paid += amount
        }

        return acc
      },
      {} as Record<string, any>,
    )

    // Get top shops by balance
    const shopsWithBalances = await prisma.shop.findMany({
      where: { userId: decoded.userId },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
    })

    const topShops = shopsWithBalances
      .map((shop) => {
        const balance = shop.transactions.reduce((sum, transaction) => {
          const amount = Number(transaction.amount)
          return transaction.type === "borrow" ? sum + amount : sum - amount
        }, 0)

        return {
          name: shop.name,
          balance,
        }
      })
      .filter((shop) => shop.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5)

    return NextResponse.json({
      totalBalance,
      monthlySpending: Object.values(monthlySpending),
      topShops,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

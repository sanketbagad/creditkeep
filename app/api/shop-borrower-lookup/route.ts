import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

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

    const { mobile } = await request.json()

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 })
    }

    // Validate mobile number format
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: "Mobile number must be exactly 10 digits" }, { status: 400 })
    }

    console.log(`Shop owner ${decoded.userId} looking up borrower with mobile: ${mobile}`)

    // Find user by mobile number
    const borrower = await prisma.user.findFirst({
      where: { mobile },
      select: { id: true, name: true, mobile: true },
    })

    if (!borrower) {
      return NextResponse.json({ error: "No user found with this mobile number" }, { status: 404 })
    }

    // Get all shops owned by current user
    const userShops = await prisma.shop.findMany({
      where: { userId: decoded.userId },
      select: { id: true, name: true },
    })

    if (userShops.length === 0) {
      return NextResponse.json({ error: "You don't have any shops" }, { status: 400 })
    }

    const shopIds = userShops.map((shop) => shop.id)

    // Get all transactions between the borrower and any of the user's shops
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: borrower.id,
        shopId: { in: shopIds },
      },
      include: {
        shop: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    })

    // Group transactions by shop and calculate balances
    const shopSummary = transactions.reduce((acc, transaction) => {
      const shopId = transaction.shopId
      const shopName = transaction.shop.name

      if (!acc[shopId]) {
        acc[shopId] = {
          shop_id: shopId,
          shop_name: shopName,
          total_borrowed: 0,
          total_paid: 0,
          outstanding_balance: 0,
          transaction_count: 0,
          last_transaction_date: transaction.transactionDate,
          transactions: [],
        }
      }

      const amount = Number(transaction.amount)
      if (transaction.type === "borrow") {
        acc[shopId].total_borrowed += amount
      } else {
        acc[shopId].total_paid += amount
      }

      acc[shopId].outstanding_balance = acc[shopId].total_borrowed - acc[shopId].total_paid
      acc[shopId].transaction_count += 1

      // Update last transaction date if this transaction is more recent
      if (new Date(transaction.transactionDate) > new Date(acc[shopId].last_transaction_date)) {
        acc[shopId].last_transaction_date = transaction.transactionDate
      }

      acc[shopId].transactions.push({
        id: transaction.id,
        amount: amount,
        type: transaction.type,
        description: transaction.description,
        transaction_date: transaction.transactionDate,
        created_at: transaction.createdAt,
      })

      return acc
    }, {} as any)

    const shopBalances = Object.values(shopSummary)
    const totalOutstanding = shopBalances.reduce((sum: number, shop: any) => sum + shop.outstanding_balance, 0)
    const totalBorrowed = shopBalances.reduce((sum: number, shop: any) => sum + shop.total_borrowed, 0)
    const totalPaid = shopBalances.reduce((sum: number, shop: any) => sum + shop.total_paid, 0)

    console.log(`Found ${transactions.length} transactions for borrower ${borrower.name}`)

    return NextResponse.json({
      borrower: {
        id: borrower.id,
        name: borrower.name,
        mobile: borrower.mobile,
      },
      shop_balances: shopBalances,
      summary: {
        total_outstanding: totalOutstanding,
        total_borrowed: totalBorrowed,
        total_paid: totalPaid,
        total_transactions: transactions.length,
        shops_count: shopBalances.length,
      },
    })
  } catch (error) {
    console.error("Error looking up shop borrower:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

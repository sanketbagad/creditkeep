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

    const { borrowerId, shopId, amount, description } = await request.json()

    if (!borrowerId || !shopId || !amount) {
      return NextResponse.json({ error: "Borrower ID, shop ID, and amount are required" }, { status: 400 })
    }

    // Verify that the shop belongs to the current user
    const shop = await prisma.shop.findFirst({
      where: {
        id: shopId,
        userId: decoded.userId,
      },
    })

    if (!shop) {
      return NextResponse.json({ error: "Shop not found or you don't have permission" }, { status: 404 })
    }

    // Verify that the borrower exists
    const borrower = await prisma.user.findUnique({
      where: { id: borrowerId },
      select: { id: true, name: true, mobile: true },
    })

    if (!borrower) {
      return NextResponse.json({ error: "Borrower not found" }, { status: 404 })
    }

    console.log(
      `Shop owner ${decoded.userId} marking payment of ₹${amount} from ${borrower.name} for shop ${shop.name}`,
    )

    // Create a payment transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: borrowerId,
        shopId: shopId,
        amount: Number(amount),
        type: "payment",
        description: description || `Payment received by ${shop.name}`,
        transactionDate: new Date(),
      },
    })

    console.log(`Successfully created payment transaction with ID: ${transaction.id}`)

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: Number(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        transaction_date: transaction.transactionDate,
        created_at: transaction.createdAt,
      },
    })
  } catch (error) {
    console.error("Error marking payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const lendTransactions = await prisma.lendTransaction.findMany({
      where: { lenderId: decoded.userId },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      take: limit,
    })

    // Format transactions for frontend
    const formattedTransactions = lendTransactions.map((transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type,
      description: transaction.description,
      transaction_date: transaction.transactionDate,
      created_at: transaction.createdAt,
      borrower_name: transaction.borrowerName,
      borrower_mobile: transaction.borrowerMobile,
    }))

    return NextResponse.json({ transactions: formattedTransactions })
  } catch (error) {
    console.error("Error fetching lend transactions:", error)
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

    const { borrowerName, borrowerMobile, amount, type, description, transactionDate } = await request.json()

    if (!borrowerName || !borrowerMobile || !amount || !type) {
      return NextResponse.json({ error: "Borrower name, mobile, amount, and type are required" }, { status: 400 })
    }

    if (!["lend", "repayment"].includes(type)) {
      return NextResponse.json({ error: "Type must be either lend or repayment" }, { status: 400 })
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(borrowerMobile)) {
      return NextResponse.json({ error: "Mobile number must be exactly 10 digits" }, { status: 400 })
    }

    const transaction = await prisma.lendTransaction.create({
      data: {
        lenderId: decoded.userId,
        borrowerName,
        borrowerMobile,
        amount,
        type,
        description: description || "",
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      },
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Error creating lend transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json()

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 })
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: "Mobile number must be exactly 10 digits" }, { status: 400 })
    }

    // Get all lending transactions for this mobile number
    const lendTransactions = await prisma.lendTransaction.findMany({
      where: { borrowerMobile: mobile },
      include: {
        lender: {
          select: {
            name: true,
            mobile: true,
          },
        },
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    })

    if (lendTransactions.length === 0) {
      return NextResponse.json({ error: "No borrowing records found for this mobile number" }, { status: 404 })
    }

    // Group by lender and calculate balances
    const lenderSummary = lendTransactions.reduce((acc, transaction) => {
      const lenderId = transaction.lenderId
      const lenderName = transaction.lender.name
      const lenderMobile = transaction.lender.mobile

      if (!acc[lenderId]) {
        acc[lenderId] = {
          lender_id: lenderId,
          lender_name: lenderName,
          lender_mobile: lenderMobile,
          total_borrowed: 0,
          total_repaid: 0,
          balance: 0,
          transactions: [],
        }
      }

      const amount = Number(transaction.amount)
      if (transaction.type === "lend") {
        acc[lenderId].total_borrowed += amount
      } else {
        acc[lenderId].total_repaid += amount
      }

      acc[lenderId].balance = acc[lenderId].total_borrowed - acc[lenderId].total_repaid

      acc[lenderId].transactions.push({
        id: transaction.id,
        amount: amount,
        type: transaction.type,
        description: transaction.description,
        transaction_date: transaction.transactionDate,
        created_at: transaction.createdAt,
      })

      return acc
    }, {} as any)

    const borrowerName = lendTransactions[0].borrowerName
    const summary = Object.values(lenderSummary)

    return NextResponse.json({
      borrower_name: borrowerName,
      borrower_mobile: mobile,
      lenders: summary,
      total_transactions: lendTransactions.length,
    })
  } catch (error) {
    console.error("Error fetching borrower details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

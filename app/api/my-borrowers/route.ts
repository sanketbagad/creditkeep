import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId

    // Get all lending transactions where current user is the lender
    const lendTransactions = await prisma.lendTransaction.findMany({
      where: { lenderId: userId },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    })

    // Group by borrower and calculate balances
    const borrowerSummary = lendTransactions.reduce((acc, transaction) => {
      const borrowerKey = transaction.borrowerMobile

      if (!acc[borrowerKey]) {
        acc[borrowerKey] = {
          borrower_name: transaction.borrowerName,
          borrower_mobile: transaction.borrowerMobile,
          total_lent: 0,
          total_repaid: 0,
          outstanding_balance: 0,
          last_transaction_date: transaction.transactionDate,
          transaction_count: 0,
          transactions: [],
        }
      }

      const amount = Number(transaction.amount)
      if (transaction.type === "lend") {
        acc[borrowerKey].total_lent += amount
      } else {
        acc[borrowerKey].total_repaid += amount
      }

      acc[borrowerKey].outstanding_balance = acc[borrowerKey].total_lent - acc[borrowerKey].total_repaid
      acc[borrowerKey].transaction_count += 1

      // Update last transaction date if this transaction is more recent
      if (new Date(transaction.transactionDate) > new Date(acc[borrowerKey].last_transaction_date)) {
        acc[borrowerKey].last_transaction_date = transaction.transactionDate
      }

      acc[borrowerKey].transactions.push({
        id: transaction.id,
        amount: amount,
        type: transaction.type,
        description: transaction.description,
        transaction_date: transaction.transactionDate,
        created_at: transaction.createdAt,
      })

      return acc
    }, {} as any)

    const borrowers = Object.values(borrowerSummary)

    // Sort by outstanding balance (highest first)
    borrowers.sort((a: any, b: any) => b.outstanding_balance - a.outstanding_balance)

    const totalOutstanding = borrowers.reduce((sum: number, borrower: any) => sum + borrower.outstanding_balance, 0)
    const totalLent = borrowers.reduce((sum: number, borrower: any) => sum + borrower.total_lent, 0)
    const totalRepaid = borrowers.reduce((sum: number, borrower: any) => sum + borrower.total_repaid, 0)

    return NextResponse.json({
      borrowers,
      summary: {
        total_borrowers: borrowers.length,
        total_outstanding: totalOutstanding,
        total_lent: totalLent,
        total_repaid: totalRepaid,
        total_transactions: lendTransactions.length,
      },
    })
  } catch (error) {
    console.error("Error fetching borrowers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

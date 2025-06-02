import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId

    console.log(`Getting borrowing details for userId: ${userId}`)

    // Get current user details
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, mobile: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`Getting borrowing details for user: ${currentUser.name} (${currentUser.mobile})`)

    // Get all lending transactions where this user is the borrower (by mobile number)
    const lendTransactions = await prisma.lendTransaction.findMany({
      where: { borrowerMobile: currentUser.mobile },
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    })

    console.log(`Found ${lendTransactions.length} transactions where user is borrower`)

    if (lendTransactions.length === 0) {
      return NextResponse.json({
        borrower_name: currentUser.name,
        borrower_mobile: currentUser.mobile,
        lenders: [],
        summary: {
          total_lenders: 0,
          total_borrowed: 0,
          total_repaid: 0,
          total_outstanding: 0,
          total_transactions: 0,
        },
      })
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
          outstanding_balance: 0,
          last_transaction_date: transaction.transactionDate,
          transaction_count: 0,
          transactions: [],
        }
      }

      const amount = Number(transaction.amount)
      if (transaction.type === "lend") {
        acc[lenderId].total_borrowed += amount
      } else {
        acc[lenderId].total_repaid += amount
      }

      acc[lenderId].outstanding_balance = acc[lenderId].total_borrowed - acc[lenderId].total_repaid
      acc[lenderId].transaction_count += 1

      // Update last transaction date if this transaction is more recent
      if (new Date(transaction.transactionDate) > new Date(acc[lenderId].last_transaction_date)) {
        acc[lenderId].last_transaction_date = transaction.transactionDate
      }

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

    const lenders = Object.values(lenderSummary)

    // Sort by outstanding balance (highest first)
    lenders.sort((a: any, b: any) => b.outstanding_balance - a.outstanding_balance)

    const totalBorrowed = lenders.reduce((sum: number, lender: any) => sum + lender.total_borrowed, 0)
    const totalRepaid = lenders.reduce((sum: number, lender: any) => sum + lender.total_repaid, 0)
    const totalOutstanding = lenders.reduce((sum: number, lender: any) => sum + lender.outstanding_balance, 0)

    console.log(
      `${currentUser.name} has borrowed from ${lenders.length} lenders, total outstanding: ₹${totalOutstanding}`,
    )

    return NextResponse.json({
      borrower_name: currentUser.name,
      borrower_mobile: currentUser.mobile,
      lenders: lenders,
      summary: {
        total_lenders: lenders.length,
        total_borrowed: totalBorrowed,
        total_repaid: totalRepaid,
        total_outstanding: totalOutstanding,
        total_transactions: lendTransactions.length,
      },
    })
  } catch (error) {
    console.error("Error fetching my borrowing details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

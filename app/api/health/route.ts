import { NextResponse } from "next/server"
import { prisma, testPrismaConnection } from "@/lib/prisma"

export async function GET() {
  try {
    const connectionTest = await testPrismaConnection()

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          error: connectionTest.error?.message || "Unknown database error",
        },
        { status: 500 },
      )
    }

    // Get some basic stats using Prisma
    const [userCount, shopCount, transactionCount] = await Promise.all([
      prisma.user.count(),
      prisma.shop.count(),
      prisma.transaction.count(),
    ])

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      orm: "prisma",
      stats: {
        users: userCount,
        shops: shopCount,
        transactions: transactionCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

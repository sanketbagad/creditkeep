import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", authenticated: false }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      // Clear invalid cookie
      const response = NextResponse.json({ error: "Invalid token", authenticated: false }, { status: 401 })
      response.cookies.delete("auth-token")
      return response
    }

    // Get user info from database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        createdAt: true,
        _count: {
          select: {
            shops: true,
            transactions: true,
          },
        },
      },
    })

    if (!user) {
      const response = NextResponse.json({ error: "User not found", authenticated: false }, { status: 404 })
      response.cookies.delete("auth-token")
      return response
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        createdAt: user.createdAt,
        stats: {
          totalShops: user._count.shops,
          totalTransactions: user._count.transactions,
        },
      },
      authenticated: true,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error", authenticated: false }, { status: 500 })
  }
}

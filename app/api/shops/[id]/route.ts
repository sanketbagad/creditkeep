import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const shopId = Number.parseInt(params.id)
    if (isNaN(shopId)) {
      return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 })
    }

    // Get shop with transaction balance
    const shop = await prisma.shop.findFirst({
      where: {
        id: shopId,
        userId: decoded.userId,
      },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
    })

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    // Calculate total balance
    const totalBalance = shop.transactions.reduce((sum, transaction) => {
      const amount = Number(transaction.amount)
      return transaction.type === "borrow" ? sum + amount : sum - amount
    }, 0)

    const shopData = {
      id: shop.id,
      name: shop.name,
      description: shop.description,
      mobile: shop.mobile,
      address: shop.address,
      created_at: shop.createdAt,
      total_balance: totalBalance,
    }

    return NextResponse.json({ shop: shopData })
  } catch (error) {
    console.error("Error fetching shop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const shopId = Number.parseInt(params.id)
    if (isNaN(shopId)) {
      return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 })
    }

    const { name, description, mobile, address } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Shop name is required" }, { status: 400 })
    }

    // Validate mobile number if provided
    if (mobile && !/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: "Mobile number must be exactly 10 digits" }, { status: 400 })
    }

    // Update shop
    const shop = await prisma.shop.updateMany({
      where: {
        id: shopId,
        userId: decoded.userId,
      },
      data: {
        name,
        description: description || null,
        mobile: mobile || null,
        address: address || null,
      },
    })

    if (shop.count === 0) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating shop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const shopId = Number.parseInt(params.id)
    if (isNaN(shopId)) {
      return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 })
    }

    // Delete shop (transactions will be deleted due to cascade)
    const shop = await prisma.shop.deleteMany({
      where: {
        id: shopId,
        userId: decoded.userId,
      },
    })

    if (shop.count === 0) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting shop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

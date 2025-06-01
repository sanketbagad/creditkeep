import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, hashPassword } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { name, email, mobile, currentPassword, newPassword } = await request.json()

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if email is already in use by another user
    if (email !== decoded.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: decoded.userId },
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 409 })
      }
    }

    // Check if mobile is already in use by another user
    if (mobile) {
      const existingMobile = await prisma.user.findFirst({
        where: {
          mobile,
          id: { not: decoded.userId },
        },
      })

      if (existingMobile) {
        return NextResponse.json({ error: "Mobile number is already registered" }, { status: 409 })
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      mobile: mobile || null,
    }

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 })
      }

      // Get current user with password hash
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { passwordHash: true },
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Verify current password
      const currentPasswordHash = await hashPassword(currentPassword)
      if (currentPasswordHash !== user.passwordHash) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
      }

      // Hash and set new password
      updateData.passwordHash = await hashPassword(newPassword)
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

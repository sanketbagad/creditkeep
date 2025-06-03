import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Find the verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    })

    if (!verification) {
      return NextResponse.json({ error: "No verification request found for this email" }, { status: 400 })
    }

    // Check if OTP has expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 })
    }

    // Check if OTP matches
    if (verification.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP. Please check and try again." }, { status: 400 })
    }

    // Extract user data from verification record
    const userData = verification.userData as any

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        passwordHash,
        mobile: userData.mobile,
        emailVerified: true,
      },
    })

    // Clean up verification record
    await prisma.emailVerification.delete({
      where: { email },
    })

    // Generate JWT token
    const token = await generateToken({ userId: user.id, email: user.email })

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

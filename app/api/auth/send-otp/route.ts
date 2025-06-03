import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"
import { getOTPEmailHtml } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, mobile } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Store user data temporarily with OTP
    await prisma.emailVerification.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
        verified: false,
        userData: {
          name,
          email,
          password,
          mobile: mobile || null,
        },
      },
      create: {
        email,
        otp,
        expiresAt,
        verified: false,
        userData: {
          name,
          email,
          password,
          mobile: mobile || null,
        },
      },
    })

    // Send OTP email
    try {
      await resend.emails.send({
        from: "hello@botbyte.in",
        to: [email],
        subject: "Verify your email - CreditKeep",
        html: getOTPEmailHtml(otp, name),
      })

      console.log(`OTP sent to ${email}: ${otp}`) // For development - remove in production

      return NextResponse.json({
        success: true,
        message: "OTP sent to your email address",
      })
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

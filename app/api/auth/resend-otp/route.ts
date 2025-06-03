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
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find existing verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    })

    if (!verification) {
      return NextResponse.json({ error: "No verification request found for this email" }, { status: 400 })
    }

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Update verification record with new OTP
    await prisma.emailVerification.update({
      where: { email },
      data: {
        otp,
        expiresAt,
        verified: false,
      },
    })

    // Get user name from stored data
    const userData = verification.userData as any
    const userName = userData.name

    // Send new OTP email
    try {
      await resend.emails.send({
        from: "hello@botbyte.in",
        to: [email],
        subject: "New verification code - CreditKeep",
        html: getOTPEmailHtml(otp, userName),
      })

      console.log(`New OTP sent to ${email}: ${otp}`) // For development - remove in production

      return NextResponse.json({
        success: true,
        message: "New OTP sent to your email address",
      })
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

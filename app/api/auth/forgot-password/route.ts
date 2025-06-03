import { NextResponse } from "next/server"
import { Resend } from "resend"
import crypto from "crypto"
import {prisma} from "@/lib/prisma"
import { getPasswordResetEmailHtml } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return NextResponse.json(
        { message: "If your email is registered, you will receive a password reset link" },
        { status: 200 },
      )
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save the reset token to the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: "hello@botbyte.in",
      to: user.email,
      subject: "Reset Your Password",
      html: getPasswordResetEmailHtml(resetLink, user.name),
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    console.log("Reset email sent:", data)

    return NextResponse.json(
      { message: "If your email is registered, you will receive a password reset link" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

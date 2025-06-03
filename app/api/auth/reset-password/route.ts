import { NextResponse } from "next/server"
import { Resend } from "resend"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { getPasswordResetSuccessEmailHtml } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Find user with this reset token and ensure it's not expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update user's password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    // Send confirmation email
    const { data, error } = await resend.emails.send({
      from: "hello@botbyte.in",
      to: user.email,
      subject: "Your Password Has Been Reset",
      html: getPasswordResetSuccessEmailHtml(user.name),
    })

    if (error) {
      console.error("Error sending confirmation email:", error)
      // Don't fail the request if confirmation email fails
    } else {
      console.log("Confirmation email sent:", data)
    }

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

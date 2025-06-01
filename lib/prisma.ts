import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Test connection function
export async function testPrismaConnection() {
  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as test`
    return { success: true, result }
  } catch (error) {
    console.error("Prisma connection failed:", error)
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}

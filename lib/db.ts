import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set")
}

// Create a connection pool
const sql = neon(process.env.DATABASE_URL!)

// Test the connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return { success: true, result }
  } catch (error) {
    console.error("Database connection failed:", error)
    return { success: false, error }
  }
}

export { sql }

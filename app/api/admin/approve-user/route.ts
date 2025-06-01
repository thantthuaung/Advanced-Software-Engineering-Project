import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      )
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const status = action === "approve" ? "approved" : "suspended"
    
    // Update user status using direct SQL with correct column names
    const updateStmt = (db as any).db.prepare(`
      UPDATE users 
      SET status = ?, approval_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const approvalDate = action === "approve" ? new Date().toISOString() : null
    updateStmt.run(status, approvalDate, userId)

    return NextResponse.json({ 
      success: true, 
      message: `User ${action}d successfully`
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    )
  }
}

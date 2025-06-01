import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const pendingUsers = await db.getPendingUsers()
    return NextResponse.json(pendingUsers)
  } catch (error) {
    console.error("Error fetching pending users:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending users" },
      { status: 500 }
    )
  }
}

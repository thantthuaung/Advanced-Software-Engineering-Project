import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const stats = await db.getAdminStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    )
  }
}

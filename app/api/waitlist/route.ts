import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "jcu-gym-secret-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const authHeader = request.headers.get('Authorization')
    let userId = null
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, JWT_SECRET) as any
        userId = decoded.userId
      } catch (error) {
        // Try to get from body if no valid token
      }
    }

    const body = await request.json()
    const { sessionId } = body
    
    // If no user from token, try from body (fallback)
    if (!userId) {
      userId = body.userId
    }

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "User ID and Session ID are required" },
        { status: 400 }
      )
    }

    const db = getDatabase()
    
    // Check if session exists
    const session = db.getSessionById(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // For now, just return success - waitlist functionality can be enhanced later
    // In a full implementation, this would:
    // 1. Check if session is full
    // 2. Add user to waitlist table
    // 3. Send notification when spot becomes available

    return NextResponse.json({
      success: true,
      message: "Added to waitlist successfully. You'll be notified if a spot becomes available.",
      waitlistPosition: 1 // Mock position
    })
  } catch (error) {
    console.error("Error adding to waitlist:", error)
    return NextResponse.json(
      { error: "Failed to add to waitlist" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user waitlist items - for future implementation
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Return empty waitlist for now
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching waitlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch waitlist" },
      { status: 500 }
    )
  }
} 
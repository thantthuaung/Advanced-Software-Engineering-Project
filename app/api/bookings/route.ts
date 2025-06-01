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
        // Try to get from localStorage/body if no valid token
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
    
    // Check if session exists and has capacity
    const session = db.getSessionById(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    if ((session as any).current_bookings >= (session as any).capacity) {
      return NextResponse.json(
        { error: "Session is fully booked" },
        { status: 400 }
      )
    }

    // Check if user already has a booking for this session
    const existingBookings = db.getUserBookings(userId)
    const hasExistingBooking = existingBookings.some((booking: any) => 
      booking.session_id === sessionId && booking.status === 'confirmed'
    )

    if (hasExistingBooking) {
      return NextResponse.json(
        { error: "You already have a booking for this session" },
        { status: 400 }
      )
    }

    // Create the booking
    const booking = db.createBooking({
      userId: userId,
      sessionId: sessionId,
      status: "confirmed"
    })

    return NextResponse.json({
      success: true,
      message: "Session booked successfully",
      booking: {
        id: booking.lastInsertRowid,
        userId: userId,
        sessionId: sessionId,
        status: "confirmed",
        bookedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}

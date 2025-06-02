import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "jcu-gym-secret-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    // Check for auth token in cookie
    const cookieToken = request.cookies.get('auth-token')?.value
    
    if (!cookieToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(cookieToken, JWT_SECRET) as any
    const userId = decoded.userId

    // Get user from database
    const db = getDatabase()
    const user = db.getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Return user data (same format as login)
    return NextResponse.json({
      success: true,
      user: {
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).first_name,
        lastName: (user as any).last_name,
        role: (user as any).role,
        membershipType: (user as any).membership_type,
        status: (user as any).status,
        expiryDate: (user as any).expiry_date
      }
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    )
  }
} 
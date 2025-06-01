import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    
    // Return empty feedback for now - this would be implemented with real feedback data
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, type, subject, description, rating } = await request.json()
    
    if (!userId || !type || !subject || !description || !rating) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const db = getDatabase()
    
    // This would create feedback in the database
    // For now, return success response
    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully"
    })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    )
  }
} 
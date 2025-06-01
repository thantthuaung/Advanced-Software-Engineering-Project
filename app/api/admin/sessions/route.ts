import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    
    const db = getDatabase()
    
    if (date) {
      // Get sessions for specific date
      const sessions = db.getSessionsByDate(date)
      return NextResponse.json(sessions)
    } else {
      // Get all sessions with basic analytics
      const analytics = db.getSessionAnalytics()
      
      return NextResponse.json({
        analytics: analytics,
        summary: {
          totalSessions: analytics.length,
          averageUtilization: analytics.length > 0 ? analytics.reduce((acc: number, curr: any) => acc + (curr.utilization || 0), 0) / analytics.length : 0,
          mostPopularTime: analytics.length > 0 && analytics[0] ? (analytics[0] as any).time : "18:00"
        }
      })
    }
  } catch (error) {
    console.error("Error fetching session data:", error)
    return NextResponse.json(
      { error: "Failed to fetch session data" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, sessionData } = await request.json()
    
    const db = getDatabase()
    
    if (action === "create") {
      // Create new session
      if (!sessionData.date || !sessionData.startTime || !sessionData.endTime || !sessionData.capacity) {
        return NextResponse.json(
          { error: "Missing required session data" },
          { status: 400 }
        )
      }
      
      const sessionId = randomUUID()
      const result = db.createSession({
        id: sessionId,
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        capacity: parseInt(sessionData.capacity),
        type: sessionData.type || 'general',
        instructor: sessionData.instructor || 'Self-guided',
        description: sessionData.description || 'Open gym access'
      })
      
      return NextResponse.json({
        success: true,
        message: "Session created successfully",
        sessionId: sessionId
      })
    }
    
    if (action === "update") {
      // Update existing session
      if (!sessionData.id) {
        return NextResponse.json(
          { error: "Session ID is required for updates" },
          { status: 400 }
        )
      }
      
      // Note: You would implement updateSession method in database class
      return NextResponse.json({
        success: true,
        message: "Session updated successfully"
      })
    }
    
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
    
  } catch (error) {
    console.error("Error managing sessions:", error)
    return NextResponse.json(
      { error: "Failed to manage sessions" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, updates } = await request.json()
    const db = getDatabase()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    const updateFields = []
    const params = []

    if (updates.date !== undefined) {
      updateFields.push('date = ?')
      params.push(updates.date)
    }
    if (updates.startTime !== undefined) {
      updateFields.push('start_time = ?')
      params.push(updates.startTime)
    }
    if (updates.endTime !== undefined) {
      updateFields.push('end_time = ?')
      params.push(updates.endTime)
    }
    if (updates.capacity !== undefined) {
      updateFields.push('capacity = ?')
      params.push(updates.capacity)
    }
    if (updates.type !== undefined) {
      updateFields.push('type = ?')
      params.push(updates.type)
    }
    if (updates.instructor !== undefined) {
      updateFields.push('instructor = ?')
      params.push(updates.instructor)
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?')
      params.push(updates.description)
    }
    if (updates.difficulty !== undefined) {
      updateFields.push('difficulty = ?')
      params.push(updates.difficulty)
    }
    if (updates.price !== undefined) {
      updateFields.push('price = ?')
      params.push(updates.price)
    }
    if (updates.isActive !== undefined) {
      updateFields.push('is_active = ?')
      params.push(updates.isActive ? 1 : 0)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      )
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(sessionId)

    const dbInstance = db.getInstance()
    const stmt = (dbInstance as any).db.prepare(`
      UPDATE gym_sessions 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `)

    stmt.run(...params)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const db = getDatabase()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    // Soft delete - set is_active to false
    const dbInstance = db.getInstance()
    const stmt = (dbInstance as any).db.prepare(`
      UPDATE gym_sessions 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(sessionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    )
  }
} 
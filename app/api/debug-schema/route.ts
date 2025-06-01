import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    
    // Get table schema for users
    const userSchemaStmt = (db as any).db.prepare("PRAGMA table_info(users)")
    const userColumns = userSchemaStmt.all()
    
    // Get table schema for gym_sessions
    const sessionSchemaStmt = (db as any).db.prepare("PRAGMA table_info(gym_sessions)")
    const sessionColumns = sessionSchemaStmt.all()
    
    // Get session count
    const sessionCountStmt = (db as any).db.prepare("SELECT COUNT(*) as count FROM gym_sessions")
    const sessionCount = sessionCountStmt.get()
    
    // Get some sample sessions
    const samplesStmt = (db as any).db.prepare("SELECT * FROM gym_sessions ORDER BY date, start_time LIMIT 5")
    const sampleSessions = samplesStmt.all()
    
    // Get today's sessions
    const today = new Date().toISOString().split('T')[0]
    const todaySessionsStmt = (db as any).db.prepare("SELECT * FROM gym_sessions WHERE date = ? ORDER BY start_time")
    const todaySessions = todaySessionsStmt.all(today)
    
    return NextResponse.json({
      success: true,
      userColumns: userColumns,
      sessionColumns: sessionColumns,
      sessionCount: sessionCount,
      sampleSessions: sampleSessions,
      todaySessions: todaySessions,
      todayDate: today,
      message: "Debug info retrieved"
    })
  } catch (error) {
    console.error("Schema debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
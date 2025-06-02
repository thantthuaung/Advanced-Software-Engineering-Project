import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const db = getDatabase()
    
    // Check existing sessions info
    const sessionCountStmt = (db as any).db.prepare('SELECT COUNT(*) as count FROM gym_sessions')
    const sessionCount = sessionCountStmt.get() as { count: number }
    
    // Get sample session dates to see what dates exist
    const sampleDatesStmt = (db as any).db.prepare('SELECT DISTINCT date FROM gym_sessions ORDER BY date LIMIT 10')
    const sampleDates = sampleDatesStmt.all()
    
    const today = new Date().toISOString().split('T')[0]
    
    // Check if today's sessions exist
    const todaySessionsStmt = (db as any).db.prepare('SELECT COUNT(*) as count FROM gym_sessions WHERE date = ?')
    const todayCount = todaySessionsStmt.get(today) as { count: number }
    
    console.log(`Current session count: ${sessionCount.count}`)
    console.log(`Today (${today}) sessions: ${todayCount.count}`)
    console.log('Sample dates:', sampleDates)
    
    if (todayCount.count === 0) {
      console.log(`Creating gym sessions for today and next 29 days...`)
      
      const insertSession = (db as any).db.prepare(`
        INSERT INTO gym_sessions (
          id, date, start_time, end_time, capacity, current_bookings, is_active, type,
          instructor, description, difficulty, waitlist_count, price, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const timeSlots = [
        { start: "06:00", end: "08:00", capacity: 25 },
        { start: "08:00", end: "10:00", capacity: 30 },
        { start: "10:00", end: "12:00", capacity: 25 },
        { start: "12:00", end: "14:00", capacity: 35 },
        { start: "14:00", end: "16:00", capacity: 30 },
        { start: "16:00", end: "18:00", capacity: 40 },
        { start: "18:00", end: "20:00", capacity: 45 },
        { start: "20:00", end: "22:00", capacity: 25 }
      ]

      let sessionsCreated = 0
      
      // Create sessions for the next 30 days starting from today (Monday to Friday only)
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (date.getDay() === 0 || date.getDay() === 6) continue
        
        const dateString = date.toISOString().split('T')[0]
        
        timeSlots.forEach((slot, index) => {
          const sessionId = `gym-${dateString}-${index}`
          const now = new Date().toISOString()
          
          try {
            insertSession.run(
              sessionId,
              dateString,
              slot.start,
              slot.end,
              slot.capacity,
              0, // Start with no bookings
              1, // is_active = true
              'general',
              'Self-guided',
              'Open gym access with full equipment availability',
              null,
              0,
              null,
              now,
              now
            )
            sessionsCreated++
          } catch (error) {
            console.error(`Error creating session ${sessionId}:`, error)
          }
        })
      }
      
      console.log(`✅ ${sessionsCreated} gym sessions created`)
      
      // Get updated counts
      const newTodayCount = todaySessionsStmt.get(today) as { count: number }
      
      return NextResponse.json({
        success: true,
        message: `${sessionsCreated} gym sessions created successfully`,
        sessionsCreated,
        todaySessionsCount: newTodayCount.count,
        date: today,
        sampleDates
      })
    } else {
    return NextResponse.json({
      success: true,
        message: `Sessions already exist for today (${todayCount.count} sessions found)`,
        sessionsCount: sessionCount.count,
        todaySessionsCount: todayCount.count,
        date: today,
        sampleDates
    })
    }
  } catch (error) {
    console.error("Error initializing sessions:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
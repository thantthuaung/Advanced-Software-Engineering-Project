import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "jcu-gym-secret-key-change-in-production"

export async function GET(request: NextRequest) {
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
        // Try from query params as fallback
      }
    }

    const { searchParams } = new URL(request.url)
    
    // If no user from token, try from query params
    if (!userId) {
      userId = searchParams.get("userId")
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const db = getDatabase()
    
    // Get user from database
    const user = db.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get user bookings to calculate stats
    const bookings = db.getUserBookings(userId)
    
    // Calculate stats
    const completedBookings = bookings.filter((booking: any) => 
      booking.status === 'completed'
    )
    
    const thisWeekBookings = bookings.filter((booking: any) => {
      const bookingDate = new Date(booking.date)
      const today = new Date()
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
      return bookingDate >= weekStart && booking.status === 'confirmed'
    })
    
    // Calculate streak (consecutive days with workouts)
    const sortedCompletedBookings = completedBookings
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let currentStreak = 0
    let lastWorkoutDate = null
    
    for (const booking of sortedCompletedBookings) {
      const workoutDate = new Date((booking as any).date)
      const today = new Date()
      
      if (!lastWorkoutDate) {
        // First workout
        lastWorkoutDate = workoutDate
        const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff <= 1) { // Today or yesterday
          currentStreak = 1
        }
      } else {
        // Check if this workout is the day before the last workout
        const daysDiff = Math.floor((lastWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          currentStreak++
          lastWorkoutDate = workoutDate
        } else {
          break // Streak broken
        }
      }
    }

    const userStats = {
      points: (user as any).points || 0,
      streak: currentStreak,
      totalWorkouts: completedBookings.length,
      weeklyWorkouts: thisWeekBookings.length,
      totalBookings: bookings.length,
      membershipType: (user as any).membership_type,
      status: (user as any).status,
      joinDate: (user as any).created_at,
      achievements: [], // To be implemented with achievements system
      favoriteTimeSlots: [] // To be calculated from booking patterns
    }

    return NextResponse.json(userStats)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    )
  }
} 
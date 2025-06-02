import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "jcu-gym-secret-key-change-in-production"

// Achievement types
const ACHIEVEMENT_TYPES = [
  {
    id: 'first_workout',
    name: 'First Workout',
    description: 'Complete your first gym session',
    icon: '🎯',
    points: 10,
    type: 'milestone'
  },
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Complete 5 workouts in a week',
    icon: '💪',
    points: 25,
    type: 'frequency'
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Workout 3 days in a row',
    icon: '🔥',
    points: 20,
    type: 'streak'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 5 morning sessions (6-9 AM)',
    icon: '🌅',
    points: 15,
    type: 'time'
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Complete 20 workouts in a month',
    icon: '🏆',
    points: 50,
    type: 'milestone'
  },
  {
    id: 'dedicated_member',
    name: 'Dedicated Member',
    description: 'Complete 100 total workouts',
    icon: '⭐',
    points: 100,
    type: 'milestone'
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token (check both Authorization header and cookie)
    const authHeader = request.headers.get('Authorization')
    const cookieToken = request.cookies.get('auth-token')?.value
    
    let userId = null
    let token = null
    
    // Try Authorization header first
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
    // Fall back to cookie
    else if (cookieToken) {
      token = cookieToken
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        userId = decoded.userId
      } catch (error) {
        console.log('JWT verification error:', error)
      }
    }

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get("userId")
    const type = searchParams.get("type") // 'all', 'user', 'types'
    
    // Use requested user ID if provided, otherwise use token user ID
    if (requestedUserId) {
      userId = requestedUserId
    }

    const db = getDatabase()

    // If requesting achievement types
    if (type === 'types') {
      return NextResponse.json(ACHIEVEMENT_TYPES)
    }

    // If requesting all achievements (admin view)
    if (type === 'all') {
      // Check if user is admin
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        const adminUser = db.getUserById(decoded.userId)
        if ((adminUser as any)?.role !== 'admin') {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
      }

      // Get all user achievements
      const stmt = (db as any).db.prepare(`
        SELECT ua.*, u.first_name, u.last_name, u.email
        FROM user_achievements ua
        JOIN users u ON ua.user_id = u.id
        ORDER BY ua.earned_at DESC
      `)
      const allAchievements = stmt.all().map((achievement: any) => ({
        ...achievement,
        user_name: `${achievement.first_name} ${achievement.last_name}`,
        achievement_info: ACHIEVEMENT_TYPES.find(t => t.id === achievement.achievement_id)
      }))

      return NextResponse.json(allAchievements)
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user's achievements
    const userAchievements = getUserAchievements(db, userId)
    
    // Calculate progress for unearned achievements
    const earnedIds = userAchievements.map((ua: any) => ua.achievement_id)
    const unearnedAchievements = ACHIEVEMENT_TYPES
      .filter(type => !earnedIds.includes(type.id))
      .map(type => ({
        ...type,
        progress: calculateAchievementProgress(db, userId, type.id),
        earned: false
      }))

    return NextResponse.json({
      earned: userAchievements,
      available: unearnedAchievements,
      totalPoints: userAchievements.reduce((sum: number, a: any) => sum + (a.points || 0), 0)
    })

  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, achievementId, adminOverride } = body

    // Verify admin access for manual achievement granting
    if (adminOverride) {
      const authHeader = request.headers.get('Authorization')
      const cookieToken = request.cookies.get('auth-token')?.value
      
      let token = null
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      } else if (cookieToken) {
        token = cookieToken
      }

      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        const db = getDatabase()
        const adminUser = db.getUserById(decoded.userId)
        if ((adminUser as any)?.role !== 'admin') {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
      }
    }

    const db = getDatabase()
    const achievement = ACHIEVEMENT_TYPES.find(a => a.id === achievementId)
    
    if (!achievement) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 })
    }

    // Check if user already has this achievement
    const existing = (db as any).db.prepare(
      'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    ).get(userId, achievementId)

    if (existing) {
      return NextResponse.json({ error: "Achievement already earned" }, { status: 400 })
    }

    // Grant achievement
    const stmt = (db as any).db.prepare(`
      INSERT INTO user_achievements (id, user_id, achievement_id, earned_at, points)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const achievementId_new = `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    stmt.run(achievementId_new, userId, achievementId, new Date().toISOString(), achievement.points)

    // Update user points
    const updatePoints = (db as any).db.prepare(
      'UPDATE users SET points = COALESCE(points, 0) + ? WHERE id = ?'
    )
    updatePoints.run(achievement.points, userId)

    return NextResponse.json({ 
      success: true, 
      message: "Achievement granted successfully",
      achievement: {
        id: achievementId_new,
        achievement_id: achievementId,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        points: achievement.points,
        type: achievement.type,
        earned_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Error granting achievement:", error)
    return NextResponse.json({ error: "Failed to grant achievement" }, { status: 500 })
  }
}

function getUserAchievements(db: any, userId: string) {
  const stmt = db.db.prepare(`
    SELECT ua.*, ua.achievement_id
    FROM user_achievements ua
    WHERE ua.user_id = ?
    ORDER BY ua.earned_at DESC
  `)
  
  return stmt.all(userId).map((achievement: any) => ({
    ...achievement,
    ...ACHIEVEMENT_TYPES.find(t => t.id === achievement.achievement_id),
    earned: true
  }))
}

function calculateAchievementProgress(db: any, userId: string, achievementId: string): number {
  const bookings = db.getUserBookings(userId)
  const completedBookings = bookings.filter((b: any) => b.status === 'completed')

  switch (achievementId) {
    case 'first_workout':
      return completedBookings.length > 0 ? 100 : 0
    
    case 'weekly_warrior':
      // Check if user has 5 workouts in any week
      const thisWeek = getThisWeekBookings(completedBookings)
      return Math.min((thisWeek.length / 5) * 100, 100)
    
    case 'consistency_king':
      // Check for 3 consecutive days
      const streak = getMaxConsecutiveDays(completedBookings)
      return Math.min((streak / 3) * 100, 100)
    
    case 'early_bird':
      // Count morning sessions (6-9 AM)
      const morningCount = completedBookings.filter((b: any) => {
        const hour = parseInt(b.start_time.split(':')[0])
        return hour >= 6 && hour < 9
      }).length
      return Math.min((morningCount / 5) * 100, 100)
    
    case 'month_master':
      // Check for 20 workouts in current month
      const thisMonth = getThisMonthBookings(completedBookings)
      return Math.min((thisMonth.length / 20) * 100, 100)
    
    case 'dedicated_member':
      // 100 total workouts
      return Math.min((completedBookings.length / 100) * 100, 100)
    
    default:
      return 0
  }
}

function getThisWeekBookings(bookings: any[]) {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  startOfWeek.setHours(0, 0, 0, 0)
  
  return bookings.filter(b => new Date(b.date) >= startOfWeek)
}

function getThisMonthBookings(bookings: any[]) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return bookings.filter(b => new Date(b.date) >= startOfMonth)
}

function getMaxConsecutiveDays(bookings: any[]): number {
  if (bookings.length === 0) return 0
  
  const dates = [...new Set(bookings.map(b => b.date))].sort()
  let maxStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1])
    const currDate = new Date(dates[i])
    const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return maxStreak
} 
import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "jcu-gym-secret-key-change-in-production"

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
    const type = searchParams.get("type") // 'all', 'user'
    const limit = parseInt(searchParams.get("limit") || "20")
    
    // Use requested user ID if provided, otherwise use token user ID
    if (requestedUserId) {
      userId = requestedUserId
    }

    const db = getDatabase()

    // If requesting all notifications (admin view)
    if (type === 'all') {
      // Check if user is admin
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        const adminUser = db.getUserById(decoded.userId)
        if ((adminUser as any)?.role !== 'admin') {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
      }

      // Get all notifications
      const stmt = (db as any).db.prepare(`
        SELECT n.*, u.first_name, u.last_name, u.email
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        ORDER BY n.created_at DESC
        LIMIT ?
      `)
      const allNotifications = stmt.all(limit).map((notification: any) => ({
        ...notification,
        user_name: notification.user_id ? `${notification.first_name} ${notification.last_name}` : 'All Users'
      }))

      return NextResponse.json(allNotifications)
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user-specific notifications + global notifications
    const stmt = (db as any).db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? OR user_id IS NULL
      ORDER BY created_at DESC
      LIMIT ?
    `)
    const notifications = stmt.all(userId, limit)

    // Mark notifications as read when fetched
    const updateStmt = (db as any).db.prepare(`
      UPDATE notifications 
      SET is_read = 1, read_at = CURRENT_TIMESTAMP
      WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0
    `)
    updateStmt.run(userId)

    return NextResponse.json(notifications)

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
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
    } else {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      message, 
      type = 'info', 
      userId = null, // null for global notifications
      priority = 'normal',
      actionUrl = null
    } = body

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    const db = getDatabase()
    
    // Create notification
    const stmt = (db as any).db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, priority, action_url, created_at, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    stmt.run(
      notificationId,
      userId,
      title,
      message,
      type,
      priority,
      actionUrl,
      new Date().toISOString(),
      0
    )

    // If it's a global notification, also create system notification for tracking
    if (!userId) {
      // Get count of active users for statistics
      const userCount = (db as any).db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'approved'").get()
      
      return NextResponse.json({ 
        success: true, 
        message: `Global notification sent to ${userCount.count} users`,
        notification: {
          id: notificationId,
          title,
          message,
          type,
          priority,
          userCount: userCount.count
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notification sent successfully",
      notification: {
        id: notificationId,
        title,
        message,
        type,
        priority,
        userId
      }
    })

  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, action } = body

    if (!notificationId || !action) {
      return NextResponse.json({ error: "Notification ID and action are required" }, { status: 400 })
    }

    const db = getDatabase()

    if (action === 'mark_read') {
      const stmt = (db as any).db.prepare(`
        UPDATE notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      stmt.run(notificationId)
    } else if (action === 'delete') {
      const stmt = (db as any).db.prepare('DELETE FROM notifications WHERE id = ?')
      stmt.run(notificationId)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
} 
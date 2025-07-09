import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import type { 
  User, 
  GymSession, 
  Booking, 
  Achievement, 
  UserAchievement, 
  Notification, 
  Feedback, 
  AdminStats,
  Waitlist,
  WorkoutBuddy,
  Announcement
} from './types'

class SQLiteDatabase {
  private db: Database.Database

  constructor() {
    // Create database directory if it doesn't exist
    const dbDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // Initialize database
    const dbPath = path.join(dbDir, 'jcu-gym.db')
    this.db = new Database(dbPath)
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON')
    
    // Initialize schema
    this.initializeSchema()
    
    // Initialize production data if needed
    if (typeof window === 'undefined') {
      setTimeout(() => {
        this.initializeProductionData().catch(console.error)
      }, 100)
    }
  }

  private initializeSchema() {
    console.log('Initializing database schema...')
    
    // Create main tables
    this.db.exec(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        student_id TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
        membership_type TEXT DEFAULT 'basic' CHECK (membership_type IN ('basic', 'premium', '1-trimester', '3-trimester', '1-year')),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'expired')),
        phone TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        emergency_contact_relationship TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approval_date DATETIME,
        expiry_date DATE,
        points INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        total_workouts INTEGER DEFAULT 0,
        payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        payment_method TEXT,
        payment_amount REAL,
        payment_date DATETIME,
        payment_reference TEXT,
        billing_address TEXT
      );

      -- Gym sessions table
      CREATE TABLE IF NOT EXISTS gym_sessions (
        id TEXT PRIMARY KEY,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 10,
        current_bookings INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        type TEXT DEFAULT 'general',
        instructor TEXT,
        description TEXT,
        difficulty TEXT,
        waitlist_count INTEGER DEFAULT 0,
        price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Bookings table
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'no-show', 'completed')),
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        check_in_time DATETIME,
        check_out_time DATETIME,
        notes TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        feedback TEXT,
        is_recurring BOOLEAN DEFAULT false,
        recurring_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES gym_sessions (id) ON DELETE CASCADE
      );

      -- User achievements table
      CREATE TABLE IF NOT EXISTS user_achievements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, achievement_id)
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT, -- NULL for global notifications
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement')),
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        action_url TEXT,
        is_read BOOLEAN DEFAULT false,
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Billing transactions table
      CREATE TABLE IF NOT EXISTS billing_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'SGD',
        description TEXT,
        transaction_type TEXT CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
        status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
        payment_method TEXT,
        payment_reference TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_date ON gym_sessions(date);
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON bookings(session_id);
      CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON user_achievements(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    `)
    
    console.log('✅ Database schema initialized')
  }

  private async initializeProductionData() {
    // Check if any admin users exist
    const adminCount = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin') as { count: number }
    
    if (adminCount.count === 0) {
      console.log('Creating initial admin user for production...')
      
      try {
        // Hash default admin password
        const adminPassword = await bcrypt.hash('admin123', 12)

        // Insert initial admin user
        const insertUser = this.db.prepare(`
          INSERT INTO users (
            id, email, password_hash, first_name, last_name, student_id, role, membership_type, status,
            phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
            created_at, approval_date, expiry_date, points, streak, total_workouts,
            payment_status, payment_method, payment_amount, payment_date, payment_reference, billing_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)

        insertUser.run(
          randomUUID(),
          'admin@my.jcu.edu.au',
          adminPassword,
          'System',
          'Administrator',
          'JC000001',
          'admin',
          'premium',
          'approved',
          '+65 6576 7000',
          'JCU IT Support',
          '+65 6576 7000',
          'Institution',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          0,
          0,
          0,
          'paid',
          'waived',
          0,
          new Date().toISOString(),
          'ADMIN_SYSTEM',
          'JCU Campus'
        )

        console.log('✅ Initial admin user created')
        
        // Initialize recurring gym sessions for the next 30 days
        this.initializeProductionSessions()
        
        // Create demo student accounts
        await this.createDemoStudents()
        
      } catch (error) {
        console.error('❌ Error creating initial admin:', error)
      }
    }
  }

  private async createDemoStudents() {
    // Check if demo students already exist
    const demoCount = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?').get('demo@my.jcu.edu.au') as { count: number }
    
    if (demoCount.count === 0) {
      console.log('Creating demo student accounts...')
      
      try {
        const demoPassword = await bcrypt.hash('demo123', 12)
        const insertUser = this.db.prepare(`
          INSERT INTO users (
            id, email, password_hash, first_name, last_name, student_id, role, membership_type, status,
            phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
            created_at, approval_date, expiry_date, points, streak, total_workouts,
            payment_status, payment_method, payment_amount, payment_date, payment_reference, billing_address
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)

        // Demo Student 1 - Basic account
        insertUser.run(
          randomUUID(),
          'demo@my.jcu.edu.au',
          demoPassword,
          'Demo',
          'Student',
          'JC142001',
          'student',
          '1-trimester',
          'approved',
          '+65 91234567',
          'Demo Parent',
          '+65 98765432',
          'Parent',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 months
          100,
          5,
          8,
          'paid',
          'credit_card',
          150,
          new Date().toISOString(),
          'PAY_DEMO001',
          '123 Demo Street, Singapore'
        )

        // Demo Student 2 - Premium account
        insertUser.run(
          randomUUID(),
          'john@my.jcu.edu.au',
          demoPassword,
          'John',
          'Doe',
          'JC142002',
          'student',
          'premium',
          'approved',
          '+65 87654321',
          'Jane Doe',
          '+65 98765431',
          'Mother',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
          250,
          12,
          25,
          'paid',
          'credit_card',
          800,
          new Date().toISOString(),
          'PAY_DEMO002',
          '456 University Ave, Singapore'
        )

        // Demo Student 3 - Staff member
        insertUser.run(
          randomUUID(),
          'sarah@my.jcu.edu.au',
          demoPassword,
          'Sarah',
          'Wilson',
          'JC900001',
          'student',
          '1-year',
          'approved',
          '+65 12345678',
          'Emergency Contact',
          '+65 87654321',
          'Colleague',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
          75,
          3,
          12,
          'paid',
          'payroll_deduction',
          500,
          new Date().toISOString(),
          'PAY_DEMO003',
          'JCU Campus, Singapore'
        )

        console.log('✅ Demo student accounts created')
        
      } catch (error) {
        console.error('❌ Error creating demo students:', error)
      }
    }
  }

  private initializeProductionSessions() {
    // Check if any sessions exist
    const sessionCount = this.db.prepare('SELECT COUNT(*) as count FROM gym_sessions').get() as { count: number }
    
    if (sessionCount.count === 0) {
      console.log('Creating production gym sessions...')
      
      const insertSession = this.db.prepare(`
        INSERT INTO gym_sessions (
          id, date, start_time, end_time, capacity, current_bookings, is_active, type,
          instructor, description, difficulty, waitlist_count, price, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const timeSlots = [
        { start: "06:00", end: "08:00", capacity: 10 },
        { start: "08:00", end: "10:00", capacity: 10 },
        { start: "10:00", end: "12:00", capacity: 10 },
        { start: "12:00", end: "14:00", capacity: 10 },
        { start: "14:00", end: "16:00", capacity: 10 },
        { start: "16:00", end: "18:00", capacity: 10 },
        { start: "18:00", end: "20:00", capacity: 10 },
        { start: "20:00", end: "22:00", capacity: 10 }
      ]

      // Create sessions for the next 30 days (Monday to Friday only)
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (date.getDay() === 0 || date.getDay() === 6) continue
        
        const dateString = date.toISOString().split('T')[0]
        
        timeSlots.forEach((slot, index) => {
          const sessionId = `gym-${dateString}-${index}`
          const now = new Date().toISOString()
          
          insertSession.run(
            sessionId,
            dateString,
            slot.start,
            slot.end,
            slot.capacity,
            0, // Start with no bookings
            true,
            'general',
            'Self-guided',
            'Open gym access with full equipment availability',
            null,
            0,
            null,
            now,
            now
          )
        })
      }
      
      console.log('✅ Production gym sessions created with 10-person capacity')
    }
  }

  // User methods
  getUserByEmail(email: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email) as User | undefined
  }

  getUserById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id) as User | undefined
  }

  getUserByStudentId(studentId: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE student_id = ?')
    return stmt.get(studentId) as User | undefined
  }

  getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC')
    return stmt.all() as User[]
  }

  createUser(userData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, student_id, role, membership_type, status,
        phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        created_at, approval_date, expiry_date, points, streak, total_workouts,
        payment_status, payment_method, payment_amount, payment_date, payment_reference, billing_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    return stmt.run(
      userData.id || randomUUID(),
      userData.email,
      userData.password_hash || userData.passwordHash,
      userData.first_name || userData.firstName,
      userData.last_name || userData.lastName,
      userData.student_id || userData.studentId,
      userData.role || 'student',
      userData.membership_type || userData.membershipType,
      userData.status || 'pending',
      userData.phone,
      userData.emergency_contact_name || (userData.emergencyContact && userData.emergencyContact.name),
      userData.emergency_contact_phone || (userData.emergencyContact && userData.emergencyContact.phone),
      userData.emergency_contact_relationship || (userData.emergencyContact && userData.emergencyContact.relationship),
      userData.created_at || userData.createdAt || new Date().toISOString(),
      userData.approval_date || userData.approvalDate,
      userData.expiry_date || userData.expiryDate,
      userData.points || 0,
      userData.streak || 0,
      userData.total_workouts || userData.totalWorkouts || 0,
      userData.payment_status || userData.paymentStatus,
      userData.payment_method || userData.paymentMethod,
      userData.payment_amount || userData.paymentAmount || 0,
      userData.payment_date || userData.paymentDate,
      userData.payment_reference || userData.paymentReference,
      userData.billing_address || userData.billingAddress
    )
  }

  updateUser(id: string, updates: Partial<User>) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
    const values = Object.values(updates)
    values.push(id)
    
    const stmt = this.db.prepare(`UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    return stmt.run(...values)
  }

  // Session methods
  getSessionsByDate(date: string) {
    const stmt = this.db.prepare('SELECT * FROM gym_sessions WHERE date = ? AND is_active = 1 ORDER BY start_time')
    return stmt.all(date) as GymSession[]
  }

  getSessionById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM gym_sessions WHERE id = ?')
    return stmt.get(id) as GymSession | undefined
  }

  createSession(sessionData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO gym_sessions (
        id, date, start_time, end_time, capacity, current_bookings, is_active, type,
        instructor, description, difficulty, waitlist_count, price, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const now = new Date().toISOString()
    
    // Convert boolean to 0/1 for SQLite
    let isActive = 1 // Default to active
    if (sessionData.is_active !== undefined) {
      isActive = sessionData.is_active ? 1 : 0
    } else if (sessionData.isActive !== undefined) {
      isActive = sessionData.isActive ? 1 : 0
    }
    
    return stmt.run(
      sessionData.id || randomUUID(),
      sessionData.date,
      sessionData.start_time || sessionData.startTime,
      sessionData.end_time || sessionData.endTime,
      sessionData.capacity,
      sessionData.current_bookings || sessionData.currentBookings || 0,
      isActive,
      sessionData.type,
      sessionData.instructor || null,
      sessionData.description || null,
      sessionData.difficulty || null,
      sessionData.price || null,
      now,
      now
    )
  }

  updateSessionBookingCount(sessionId: string, increment: number = 1) {
    const stmt = this.db.prepare(`
      UPDATE gym_sessions 
      SET current_bookings = current_bookings + ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    return stmt.run(increment, sessionId)
  }

  // Booking methods
  createBooking(bookingData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO bookings (
        id, user_id, session_id, booking_date, status, check_in_time, check_out_time,
        notes, rating, feedback, is_recurring, recurring_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const now = new Date().toISOString()
    
    // Prepare parameters with explicit null values instead of undefined
    const params = [
      bookingData.id || randomUUID(),
      bookingData.user_id || bookingData.userId,
      bookingData.session_id || bookingData.sessionId,
      bookingData.booking_date || bookingData.bookingDate || now,
      bookingData.status || 'confirmed',
      null, // check_in_time
      null, // check_out_time
      null, // notes
      null, // rating
      null, // feedback
      0,    // is_recurring (always 0 for now)
      null, // recurring_id
      now,  // created_at
      now   // updated_at
    ]
    
    const result = stmt.run(...params)
    
    // Update session booking count
    this.updateSessionBookingCount(bookingData.session_id || bookingData.sessionId, 1)
    
    return result
  }

  getUserBookings(userId: string) {
    const stmt = this.db.prepare(`
      SELECT b.*, s.date, s.start_time, s.end_time, s.type, s.description
      FROM bookings b
      JOIN gym_sessions s ON b.session_id = s.id
      WHERE b.user_id = ?
      ORDER BY s.date DESC, s.start_time DESC
    `)
    return stmt.all(userId)
  }

  getBookingsBySession(sessionId: string) {
    const stmt = this.db.prepare(`
      SELECT b.*, u.first_name, u.last_name, u.email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.session_id = ? AND u.role != 'admin'
      ORDER BY b.created_at
    `)
    return stmt.all(sessionId)
  }

  // Billing methods
  getBillingTransactions() {
    const stmt = this.db.prepare(`
      SELECT bt.*, u.first_name || ' ' || u.last_name as user_name, u.email as user_email
      FROM billing_transactions bt
      JOIN users u ON bt.user_id = u.id
      ORDER BY bt.created_at DESC
    `)
    return stmt.all()
  }

  createBillingTransaction(transaction: any) {
    const stmt = this.db.prepare(`
      INSERT INTO billing_transactions (
        id, user_id, amount, payment_method, payment_reference, 
        transaction_type, description, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    return stmt.run(
      transaction.id || randomUUID(),
      transaction.user_id || transaction.userId,
      transaction.amount,
      transaction.payment_method || transaction.paymentMethod,
      transaction.payment_reference || transaction.paymentReference,
      transaction.transaction_type || transaction.transactionType || 'payment',
      transaction.description || 'Membership payment',
      transaction.status || 'completed',
      new Date().toISOString()
    )
  }



  getWeeklySessionCount() {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM gym_sessions 
      WHERE date >= date('now', '-7 days') AND date <= date('now')
    `)
    return stmt.get() as { count: number }
  }

  getWeeklyBookingCount() {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings b
      JOIN gym_sessions s ON b.session_id = s.id
      WHERE s.date >= date('now', '-7 days') AND s.date <= date('now')
      AND b.status = 'confirmed'
    `)
    return stmt.get() as { count: number }
  }

  getAdminStats(): AdminStats {
    const totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE role != ?').get('admin') as { count: number }
    const activeUsers = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE status = ? AND role != ?').get('approved', 'admin') as { count: number }
    const pendingApprovals = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE status = ?').get('pending') as { count: number }
    const todayBookings = this.db.prepare('SELECT COUNT(*) as count FROM bookings WHERE date(created_at) = date(\'now\')').get() as { count: number }
    
    const popularTimeSlots: { time: string; bookings: number }[] = []

    return {
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      pendingApprovals: pendingApprovals.count,
      todayBookings: todayBookings.count,
      weeklyAttendance: 0, // Will be calculated from actual data
      noShowRate: 8.2,
      popularTimeSlots,
      revenue: {
        monthly: 0,
        yearly: 0,
        breakdown: []
      },
      peakHours: [],
      membershipDistribution: [],

    }
  }

  getInstance() {
    return this
  }

  close() {
    this.db.close()
  }
}

// Singleton instance
let instance: SQLiteDatabase | null = null

export function getDatabase(): SQLiteDatabase {
  if (!instance) {
    instance = new SQLiteDatabase()
  }
  return instance
}

export default getDatabase 
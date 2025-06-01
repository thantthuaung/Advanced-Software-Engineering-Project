import { NextRequest, NextResponse } from "next/server"
import dbInstance from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    // Clear existing users
    const clearStmt = dbInstance.getInstance().prepare('DELETE FROM users')
    clearStmt.run()

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12)
    const studentPassword = await bcrypt.hash('password123', 12)

    // Insert demo users with correct email format and schema
    const insertUser = dbInstance.getInstance().prepare(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, student_id, role, membership_type, status,
        phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        approval_date, expiry_date, points, streak, total_workouts,
        payment_status, payment_method, payment_amount, payment_date, payment_reference, billing_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    // Admin user
    insertUser.run(
      'admin-1',
      'admin@my.jcu.edu.au',
      adminPassword,
      'Admin',
      'User',
      'JC000001',
      'admin',
      'premium',
      'approved',
      '+65 9123 4567',
      'JCU Security',
      '+65 6576 7000',
      'Institution',
      new Date().toISOString(),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      0,
      0,
      0,
      'paid',
      'waived',
      0,
      new Date().toISOString(),
      'ADMIN_WAIVED',
      'JCU Campus'
    )

    // Demo student
    insertUser.run(
      'student-1',
      'student@my.jcu.edu.au',
      studentPassword,
      'Demo',
      'Student',
      'JC123456',
      'student',
      '1-trimester',
      'approved',
      '+65 9876 5432',
      'Demo Parent',
      '+65 9999 8888',
      'Parent',
      new Date().toISOString(),
      new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 months from now
      150,
      5,
      15,
      'paid',
      'credit_card',
      150,
      new Date().toISOString(),
      'CC_DEMO_123',
      '123 Demo Street, Singapore'
    )

    return NextResponse.json({
      success: true,
      message: "Database reset and reseeded successfully"
    })
  } catch (error) {
    console.error("Database reset error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 
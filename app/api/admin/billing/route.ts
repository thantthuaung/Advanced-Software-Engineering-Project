import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const search = searchParams.get('search')

    const db = getDatabase()

    // Get all billing transactions with user information
    let query = `
      SELECT 
        bt.*,
        u.first_name,
        u.last_name,
        u.email,
        u.student_id,
        u.membership_type,
        u.expiry_date,
        u.payment_status
      FROM billing_transactions bt
      JOIN users u ON bt.user_id = u.id
      WHERE 1=1
    `

    const params = []
    if (status) {
      query += ' AND bt.status = ?'
      params.push(status)
    }
    if (paymentMethod) {
      query += ' AND bt.payment_method = ?'
      params.push(paymentMethod)
    }
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }

    query += ' ORDER BY bt.created_at DESC'

    const stmt = (db as any).db.prepare(query)
    const transactions = stmt.all(...params).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      transactionType: row.transaction_type,
      amount: row.amount,
      currency: row.currency,
      paymentMethod: row.payment_method,
      paymentReference: row.payment_reference,
      description: row.description,
      status: row.status,
      processedBy: row.processed_by,
      processedAt: row.processed_at,
      createdAt: row.created_at,
      user: {
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        studentId: row.student_id,
        membershipType: row.membership_type,
        expiryDate: row.expiry_date,
        paymentStatus: row.payment_status
      }
    }))

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching billing data:", error)
    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, transactionType, amount, paymentMethod, description, processedBy } = await request.json()

    if (!userId || !transactionType || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      )
    }

    const db = getDatabase()
    const transactionId = randomUUID()
    const paymentReference = `${transactionType.toUpperCase()}_${randomUUID().slice(0, 8)}`

    const stmt = (db as any).db.prepare(`
      INSERT INTO billing_transactions (
        id, user_id, transaction_type, amount, payment_method, 
        payment_reference, description, status, processed_by, processed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      transactionId,
      userId,
      transactionType,
      amount,
      paymentMethod,
      paymentReference,
      description || null,
      'completed',
      processedBy,
      new Date().toISOString()
    )

    // Update user payment status if this is a payment
    if (transactionType === 'payment') {
      const updateUser = (db as any).db.prepare(`
        UPDATE users 
        SET payment_status = 'paid', payment_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      updateUser.run(userId)
    }

    return NextResponse.json({ 
      success: true, 
      transactionId,
      paymentReference,
      message: "Transaction created successfully" 
    })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { transactionId, status, processedBy } = await request.json()

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: "Transaction ID and status are required" },
        { status: 400 }
      )
    }

    const db = getDatabase()

    const stmt = (db as any).db.prepare(`
      UPDATE billing_transactions 
      SET status = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(status, processedBy, transactionId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    )
  }
} 
import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      email,
      password,
      firstName,
      lastName,
      studentId,
      membershipType,
      paymentMethod,
      cardNumber,
      expiryDate,
      cvv,
      phone,
      emergencyContact,
      billingAddress
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !studentId || !membershipType || !paymentMethod) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@my\.jcu\.edu\.au$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please use your JCU email address (@my.jcu.edu.au)" },
        { status: 400 }
      )
    }

    // Validate student ID format
    if (!studentId || typeof studentId !== 'string') {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      )
    }

    // Validate numeric student ID (typically 8 digits for JCU)
    const cleanStudentId = studentId.trim()
    if (!/^\d{6,10}$/.test(cleanStudentId)) {
      return NextResponse.json(
        { error: "Student ID must be 6-10 digits (e.g., 14742770)" },
        { status: 400 }
      )
    }

    // Validate card number (Luhn algorithm)
    if (paymentMethod === 'credit_card') {
      if (!cardNumber || !expiryDate || !cvv) {
        return NextResponse.json(
          { error: "Credit card information is required" },
          { status: 400 }
        )
      }

      // Basic card number validation (remove spaces and check if all digits)
      const cleanCardNumber = cardNumber.replace(/\s/g, '')
      if (!/^\d{13,19}$/.test(cleanCardNumber)) {
        return NextResponse.json(
          { error: "Please enter a valid card number" },
          { status: 400 }
        )
      }

      // Luhn algorithm validation
      if (!isValidCardNumber(cleanCardNumber)) {
        return NextResponse.json(
          { error: "Please enter a valid card number" },
          { status: 400 }
        )
      }

      // Validate expiry date (MM/YY format)
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        return NextResponse.json(
          { error: "Please enter expiry date in MM/YY format" },
          { status: 400 }
        )
      }

      // Check if card is not expired
      const [month, year] = expiryDate.split('/').map((num: string) => parseInt(num, 10))
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear() % 100

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return NextResponse.json(
          { error: "Card has expired" },
          { status: 400 }
        )
      }

      // Validate CVV
      if (!/^\d{3,4}$/.test(cvv)) {
        return NextResponse.json(
          { error: "Please enter a valid CVV" },
          { status: 400 }
        )
      }
    }

    const db = getDatabase()

    // Check if user already exists by email
    const existingUserByEmail = db.getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please use a different email or try logging in." },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const existingUserByStudentId = db.getUserByStudentId(cleanStudentId)
    if (existingUserByStudentId) {
      return NextResponse.json(
        { error: "This student ID is already registered. Please check your student ID or contact support if you believe this is an error." },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Calculate membership pricing and expiry
    const membershipPricing = {
      '1-trimester': { amount: 150, months: 4 },
      '3-trimester': { amount: 400, months: 12 },
      '1-year': { amount: 450, months: 12 }
    }

    const pricing = membershipPricing[membershipType as keyof typeof membershipPricing]
    if (!pricing) {
      return NextResponse.json(
        { error: "Invalid membership type" },
        { status: 400 }
      )
    }

    // For production, you would integrate with a real payment processor here
    // For now, we'll create a payment reference and mark as pending verification
    const paymentReference = `PAY_${randomUUID().slice(0, 8).toUpperCase()}`
    
    // Calculate expiry date
    const expiryDateCalc = new Date()
    expiryDateCalc.setMonth(expiryDateCalc.getMonth() + pricing.months)

    const userId = randomUUID()

    try {
      // Create user account (pending status until payment is verified)
      db.createUser({
        id: userId,
        email,
        passwordHash,
        firstName,
        lastName,
        studentId: cleanStudentId, // Use cleaned student ID
        role: 'student',
        membershipType,
        status: 'pending', // Will be approved after payment verification
        phone: phone || '', // Handle missing phone
        emergencyContact: emergencyContact ? {
          name: emergencyContact.name,
          phone: emergencyContact.phone,
          relationship: emergencyContact.relationship
        } : undefined,
        expiryDate: expiryDateCalc.toISOString().split('T')[0],
        paymentStatus: 'pending',
        paymentMethod,
        paymentAmount: pricing.amount,
        paymentReference,
        billingAddress: billingAddress || ''
      })

      // Create billing transaction record
      const transactionId = randomUUID()
      db.createBillingTransaction({
        id: transactionId,
        userId: userId,
        amount: pricing.amount,
        paymentMethod,
        paymentReference,
        transactionType: 'payment',
        description: `${membershipType} membership registration`,
        status: 'pending' // Will be updated when payment is confirmed
      })

      return NextResponse.json({
        success: true,
        message: "Registration submitted successfully! Your account is pending approval and payment verification.",
        userId: userId,
        paymentReference: paymentReference,
        amount: pricing.amount,
        membershipType: membershipType
      })

    } catch (dbError: any) {
      console.error("Database error during user creation:", dbError)
      
      // Handle specific SQLite constraint errors
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        if (dbError.message.includes('users.email')) {
          return NextResponse.json(
            { error: "An account with this email already exists. Please use a different email or try logging in." },
            { status: 400 }
          )
        } else if (dbError.message.includes('users.student_id')) {
          return NextResponse.json(
            { error: "This student ID is already registered. Please check your student ID or contact support if you believe this is an error." },
            { status: 400 }
          )
        } else {
          return NextResponse.json(
            { error: "This information is already registered. Please check your details or contact support." },
            { status: 400 }
          )
        }
      }
      
      // Handle other database errors
      throw dbError
    }

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    )
  }
}

// Luhn algorithm for credit card validation
function isValidCardNumber(cardNumber: string): boolean {
  let sum = 0
  let isEven = false

  // Loop through values starting from the right
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

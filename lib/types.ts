export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "student" | "staff" | "admin"
  membershipType: "1-trimester" | "3-trimester" | "1-year" | "premium" | "guest"
  status: "pending" | "approved" | "suspended"
  phone: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  registrationDate: string
  approvalDate?: string
  suspensionCount: number
  preferences: UserPreferences
  achievements: string[]
  points: number
  streak: number
  totalWorkouts: number
  favoriteTimeSlots: string[]
  notificationSettings: NotificationSettings
  healthProfile?: HealthProfile
  paymentInfo?: PaymentInfo
}

export interface UserPreferences {
  enableNotifications: boolean
  preferredWorkoutTimes: string[]
  privacySettings: {
    shareAchievements: boolean
    showOnLeaderboard: boolean
    allowBuddyRequests: boolean
  }
  recurringBookings: RecurringBooking[]
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  reminderTimes: number[]
  waitlistUpdates: boolean
  achievements: boolean
  announcements: boolean
}

export interface HealthProfile {
  height?: number
  weight?: number
  fitnessGoals: string[]
  medicalConditions?: string[]
  emergencyMedicalInfo?: string
  lastHealthCheck?: string
}

export interface PaymentInfo {
  stripeCustomerId?: string
  lastPayment?: string
  nextPayment?: string
  paymentHistory: Payment[]
  autoRenewal: boolean
}

export interface Payment {
  id: string
  amount: number
  currency: string
  date: string
  status: "completed" | "pending" | "failed"
  type: "membership" | "guest-pass"
  description: string
}

export interface GymSession {
  id: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  currentBookings: number
  isActive: boolean
  type: "general" | "class" | "personal-training"
  instructor?: string
  description?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  price?: number
}

export interface Booking {
  id: string
  userId: string
  sessionId: string
  bookingDate: string
  status: "confirmed" | "cancelled" | "no-show" | "completed"
  session: GymSession
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  rating?: number
  feedback?: string
  isRecurring: boolean
  recurringId?: string
}

export interface RecurringBooking {
  id: string
  userId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  startDate: string
  endDate?: string
  sessionType: string
}

export interface Waitlist {
  id: string
  userId: string
  sessionId: string
  position: number
  createdAt: string
  estimatedWaitTime?: number
  notificationSent: boolean
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingApprovals: number
  todayBookings: number
  weeklyAttendance: number
  noShowRate: number
  popularTimeSlots: { time: string; bookings: number }[]
  revenue: {
    monthly: number
    yearly: number
    breakdown: { type: string; amount: number }[]
  }
  peakHours: { hour: number; utilization: number }[]
  membershipDistribution: { type: string; count: number }[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    total: number
    totalPages: number
  }
}

export interface BookingForm {
  sessionId: string
  notes?: string
}

export interface UserProfileForm {
  firstName: string
  lastName: string
  phone: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  preferences: Partial<UserPreferences>
}

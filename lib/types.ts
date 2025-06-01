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
  waitlistCount: number
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

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: "attendance" | "streak" | "milestone" | "social"
  criteria: string
  points: number
  rarity: "common" | "rare" | "epic" | "legendary"
  isHidden: boolean
}

export interface UserAchievement {
  userId: string
  achievementId: string
  unlockedAt: string
  progress: number
  isCompleted: boolean
}

export interface Notification {
  id: string
  userId: string
  type: "booking_reminder" | "waitlist_update" | "achievement" | "announcement" | "system"
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
  scheduledFor?: string
  channels: ("email" | "sms" | "push")[]
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: "info" | "warning" | "emergency" | "promotion"
  authorId: string
  targetAudience: "all" | "students" | "staff" | "premium"
  isActive: boolean
  publishedAt: string
  expiresAt?: string
  attachments?: string[]
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: "individual" | "group" | "department"
  startDate: string
  endDate: string
  criteria: string
  reward: {
    points: number
    achievement?: string
    prize?: string
  }
  participants: string[]
  leaderboard: { userId: string; score: number; rank: number }[]
  isActive: boolean
}

export interface WorkoutBuddy {
  id: string
  requesterUserId: string
  targetUserId: string
  status: "pending" | "accepted" | "declined"
  message?: string
  createdAt: string
  respondedAt?: string
}

export interface Feedback {
  id: string
  userId: string
  type: "facility" | "session" | "general"
  subject: string
  description: string
  rating: number
  status: "open" | "in-progress" | "resolved"
  attachments?: string[]
  createdAt: string
  response?: {
    message: string
    adminId: string
    respondedAt: string
  }
}

export interface Locker {
  id: string
  number: string
  size: "small" | "medium" | "large"
  location: string
  status: "available" | "rented" | "maintenance"
  monthlyRate: number
  currentTenantId?: string
  rentedUntil?: string
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
  waitlistStats: { averageWaitTime: number; totalWaitlisted: number }
  achievementStats: { mostEarned: string; totalUnlocked: number }
  feedbackSummary: { averageRating: number; openTickets: number }
}

export interface Analytics {
  userEngagement: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    averageSessionDuration: number
    retentionRate: number
  }
  facilityUsage: {
    peakHours: { hour: number; percentage: number }[]
    roomUtilization: { room: string; percentage: number }[]
  }
  financial: {
    revenue: number
    projectedRevenue: number
    membershipGrowth: number
    paymentFailures: number
  }
}

export interface CalendarIntegration {
  id: string
  userId: string
  provider: "google" | "outlook" | "apple"
  accessToken: string
  refreshToken: string
  calendarId: string
  syncEnabled: boolean
  lastSync: string
}

export interface AIRecommendation {
  id: string
  userId: string
  type: "workout_time" | "class" | "buddy"
  recommendation: string
  confidence: number
  reasoning: string
  createdAt: string
  accepted?: boolean
}

export interface EmergencyContact {
  id: string
  facilityId: string
  type: "medical" | "security" | "maintenance" | "management"
  name: string
  phone: string
  email: string
  isActive: boolean
}

export interface MaintenanceRequest {
  id: string
  facilityArea?: string
  reportedBy: string
  description: string
  priority: "low" | "medium" | "high" | "emergency"
  status: "reported" | "assigned" | "in-progress" | "completed"
  assignedTo?: string
  createdAt: string
  completedAt?: string
  cost?: number
  images?: string[]
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
    limit: number
    total: number
    totalPages: number
  }
}

export interface BookingForm {
  sessionId: string
  notes?: string
  isRecurring?: boolean
  recurringPattern?: {
    frequency: "weekly" | "biweekly" | "monthly"
    endDate?: string
  }
}

export interface FeedbackForm {
  type: "facility" | "session" | "general"
  subject: string
  description: string
  rating: number
  attachments?: File[]
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
  healthProfile?: Partial<HealthProfile>
}

import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const stats = await db.getAdminStats()
    
    // Return sample analytics data
    const analytics = {
      userEngagement: {
        dailyActiveUsers: Math.floor(stats.activeUsers * 0.3),
        weeklyActiveUsers: Math.floor(stats.activeUsers * 0.7),
        monthlyActiveUsers: stats.activeUsers,
        averageSessionDuration: 45,
        retentionRate: 85
      },
      facilityUsage: {
        peakHours: stats.peakHours,
        roomUtilization: [
          { room: "Main Gym", percentage: 78 },
          { room: "Cardio Area", percentage: 65 },
          { room: "Strength Training", percentage: 82 }
        ]
      },
      financial: {
        revenue: stats.revenue.monthly,
        projectedRevenue: stats.revenue.monthly * 1.15,
        membershipGrowth: 12,
        paymentFailures: 2
      }
    }
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
} 
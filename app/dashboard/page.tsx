"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  Trophy, 
  Bell, 
  Dumbbell, 
  TrendingUp, 
  Star,
  Users,
  Target,
  Flame,
  MapPin,
  BookOpen,
  GraduationCap,
  LogOut
} from "lucide-react"
import type { Booking, Achievement, Notification, UserAchievement } from "@/lib/types"
import { NotificationsPanel } from "@/components/notifications-panel"
import { AchievementsPanel } from "@/components/achievements-panel"

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBookings: 0,
    currentStreak: 0,
    totalPoints: 0,
    weeklyWorkouts: 0
  })
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [recentAchievements, setRecentAchievements] = useState<UserAchievement[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return
    
    if (!user) {
      router.push("/auth/login")
      return
    }
    fetchDashboardData()
  }, [user, router, authLoading])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Fetch bookings
      const bookingsResponse = await fetch("/api/bookings/user", { 
        headers,
        credentials: 'include' // Include cookies for session authentication
      })
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        
        // Store all bookings
        setAllBookings(bookingsData)
        
        const upcoming = bookingsData
          .filter((booking: Booking) => {
            const sessionDate = new Date(booking.session.date)
            const today = new Date()
            const isUpcoming = sessionDate >= today && booking.status === "confirmed"
            return isUpcoming
          })
          .sort((a: Booking, b: Booking) => 
            new Date(a.session.date).getTime() - new Date(b.session.date).getTime()
          )
          .slice(0, 3)
        
        setUpcomingBookings(upcoming)
        
        // Calculate stats from real data
        const completedBookings = bookingsData.filter((b: any) => b.status === 'completed')
        const thisWeekBookings = bookingsData.filter((b: any) => {
          const bookingDate = new Date(b.session.date)
          const today = new Date()
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
          return bookingDate >= weekStart && b.status === 'confirmed'
        })
        
        setStats(prev => ({ 
          ...prev, 
          totalBookings: bookingsData.length,
          weeklyWorkouts: thisWeekBookings.length
        }))
      } else {
        console.error('Error fetching bookings:', bookingsResponse.status)
      }

      // Fetch user-specific achievements
      const achievementsResponse = await fetch(`/api/achievements?userId=${user?.id}`, { 
        headers,
        credentials: 'include'
      })
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json()
        setRecentAchievements(achievementsData.slice(0, 3))
      }

      // Fetch user-specific notifications
      const notificationsResponse = await fetch(`/api/notifications?userId=${user?.id}`, { 
        headers,
        credentials: 'include'
      })
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.slice(0, 5))
      }

      // Get user stats from database or calculate from bookings
      if (user?.id) {
        try {
          const userStatsResponse = await fetch(`/api/user-stats?userId=${user.id}`, { 
            headers,
            credentials: 'include'
          })
          if (userStatsResponse.ok) {
            const userStats = await userStatsResponse.json()
            setStats(prev => ({
              ...prev,
              totalPoints: userStats.points || 0,
              currentStreak: userStats.streak || 0
            }))
          }
        } catch (error) {
          console.log('User stats API not available, using default values')
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header with Ocean Wave Pattern */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-5"></div>
        <div className="absolute bottom-0 left-0 w-full h-16">
          <svg viewBox="0 0 1200 120" className="w-full h-full fill-blue-100 opacity-30">
            <path d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z"/>
          </svg>
        </div>
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* JCU Official Logo */}
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg p-1.5">
                <svg viewBox="0 0 200 150" className="w-full h-full">
                  {/* JCU Logo Recreation */}
                  <defs>
                    <linearGradient id="sunGradientDash" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B"/>
                      <stop offset="100%" stopColor="#D97706"/>
                    </linearGradient>
                    <linearGradient id="waveGradientDash" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB"/>
                      <stop offset="100%" stopColor="#1D4ED8"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Sun */}
                  <circle cx="150" cy="30" r="18" fill="url(#sunGradientDash)"/>
                  <path d="M150,5 L155,20 L170,15 L160,25 L175,30 L160,35 L170,45 L155,40 L150,55 L145,40 L130,45 L140,35 L125,30 L140,25 L130,15 L145,20 Z" fill="url(#sunGradientDash)"/>
                  
                  {/* Ocean Waves */}
                  <path d="M10,60 Q50,45 90,60 T170,60 L170,90 Q130,75 90,90 T10,90 Z" fill="url(#waveGradientDash)"/>
                  <path d="M10,80 Q50,65 90,80 T170,80 L170,110 Q130,95 90,110 T10,110 Z" fill="url(#waveGradientDash)" opacity="0.8"/>
                  <path d="M10,100 Q50,85 90,100 T170,100 L170,130 Q130,115 90,130 T10,130 Z" fill="url(#waveGradientDash)" opacity="0.6"/>
                  
                  {/* JCU Letters */}
                  <text x="20" y="45" fontSize="24" fontWeight="bold" fill="#1F2937">JCU</text>
                </svg>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">JCU Fitness Center</h1>
                <p className="text-blue-700 font-medium">Welcome back, {user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">Student ID</p>
                <p className="text-lg font-bold text-blue-900">{user?.email}</p>
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-medium">Total Points</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalPoints}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 font-medium">Current Streak</p>
                  <p className="text-3xl font-bold text-amber-700">{stats.currentStreak} days</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <Flame className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-medium">This Week</p>
                  <p className="text-3xl font-bold text-green-700">{stats.weeklyWorkouts} workouts</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 font-medium">Total Sessions</p>
                  <p className="text-3xl font-bold text-purple-700">{stats.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-blue-200 shadow-md">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="book" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
              Book Session
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upcoming Sessions */}
              <Card className="bg-white shadow-lg border border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription className="text-blue-100">Your next gym sessions</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                      <p className="text-blue-600 mb-4">No upcoming sessions</p>
                      <Button 
                        onClick={() => router.push("/dashboard/book")}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Book a Session
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-blue-900">
                                {new Date(booking.session.date).toLocaleDateString("en-AU", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-blue-600 text-sm">
                                {formatTime(booking.session.startTime)} - {formatTime(booking.session.endTime)}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                        onClick={() => router.push("/dashboard/book")}
                      >
                        Book Another Session
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-white shadow-lg border border-amber-100">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription className="text-amber-100">Your latest milestones</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {recentAchievements.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                      <p className="text-amber-600">Keep working out to earn achievements!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentAchievements.map((userAchievement) => (
                        <div key={userAchievement.achievementId} className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-amber-900">Achievement</p>
                            <p className="text-amber-600 text-sm">Progress: {userAchievement.progress}%</p>
                            <Progress value={userAchievement.progress} className="mt-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="book">
            <Card className="bg-white shadow-lg border border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Your Booked Sessions
                </CardTitle>
                <CardDescription className="text-blue-100">View and manage your gym session bookings</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <Button 
                    onClick={() => router.push("/dashboard/book")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book New Session
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600">Loading your bookings...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Upcoming Bookings */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Upcoming Sessions
                      </h3>
                      {upcomingBookings.length === 0 ? (
                        <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
                          <Calendar className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                          <p className="text-blue-600 font-medium">No upcoming sessions</p>
                          <p className="text-blue-500 text-sm mt-1">Book your next workout session!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {upcomingBookings.map((booking) => (
                            <div key={booking.id} className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                    <Dumbbell className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-green-900 text-lg">
                                      {new Date(booking.session.date).toLocaleDateString("en-AU", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                    <p className="text-green-700 font-medium">
                                      {formatTime(booking.session.startTime)} - {formatTime(booking.session.endTime)}
                                    </p>
                                    <p className="text-green-600 text-sm">
                                      🎯 {booking.session.description || 'Open gym access'}
                                    </p>
                                  </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  {booking.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Past Bookings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <Trophy className="h-5 w-5 mr-2" />
                        Recent Sessions
                      </h3>
                      {(() => {
                        // Filter for past bookings (completed, cancelled, or past date)
                        const pastBookings = allBookings
                          .filter((booking: Booking) => {
                            const sessionDate = new Date(booking.session.date)
                            const today = new Date()
                            return sessionDate < today || booking.status !== "confirmed"
                          })
                          .sort((a: Booking, b: Booking) => 
                            new Date(b.session.date).getTime() - new Date(a.session.date).getTime()
                          )
                          .slice(0, 5); // Show only 5 most recent
                        
                        return pastBookings.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                            <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">No past sessions yet</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push("/dashboard/history")}
                              className="mt-3 border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                              View Full History
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {pastBookings.map((booking) => (
                              <div key={booking.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                                      <Dumbbell className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        {new Date(booking.session.date).toLocaleDateString("en-AU", {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </p>
                                      <p className="text-gray-600 text-sm">
                                        {formatTime(booking.session.startTime)} - {formatTime(booking.session.endTime)}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={
                                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                    booking.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                    booking.status === 'cancelled' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                    'bg-gray-100 text-gray-800 border-gray-300'
                                  }>
                                    {booking.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            <div className="pt-3 border-t border-gray-200">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push("/dashboard/history")}
                                className="w-full border-gray-300 text-gray-600 hover:bg-gray-100"
                              >
                                View Full History
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsPanel userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsPanel userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white shadow-lg border border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Workout History & Analytics
                </CardTitle>
                <CardDescription className="text-blue-100">Your fitness journey insights and progress tracking</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600">Loading history...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{allBookings.length}</p>
                        <p className="text-blue-700 text-sm font-medium">Total Sessions</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-900">
                          {allBookings.filter(b => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.session.date) < new Date())).length}
                        </p>
                        <p className="text-green-700 text-sm font-medium">Completed</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-900">
                          {allBookings.filter(b => b.status === 'cancelled').length}
                        </p>
                        <p className="text-orange-700 text-sm font-medium">Cancelled</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <Flame className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-900">{stats.currentStreak}</p>
                        <p className="text-purple-700 text-sm font-medium">Day Streak</p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Recent Activity
                      </h3>
                      {allBookings.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">No workout history yet</p>
                          <p className="text-gray-500 text-sm mt-1">Book your first session to get started!</p>
                          <Button 
                            onClick={() => router.push("/dashboard/book")}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Book Session
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {allBookings
                            .sort((a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime())
                            .slice(0, 10)
                            .map((booking) => (
                              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    booking.status === 'completed' || (booking.status === 'confirmed' && new Date(booking.session.date) < new Date()) 
                                      ? 'bg-green-500' 
                                      : booking.status === 'cancelled' 
                                      ? 'bg-orange-500' 
                                      : 'bg-blue-500'
                                  }`}>
                                    <Dumbbell className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {new Date(booking.session.date).toLocaleDateString("en-AU", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                      {formatTime(booking.session.startTime)} - {formatTime(booking.session.endTime)}
                                    </p>
                                  </div>
                                </div>
                                <Badge className={
                                  booking.status === 'completed' || (booking.status === 'confirmed' && new Date(booking.session.date) < new Date())
                                    ? 'bg-green-100 text-green-800 border-green-300' 
                                    : booking.status === 'cancelled' 
                                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                                    : booking.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                }>
                                  {booking.status === 'confirmed' && new Date(booking.session.date) < new Date() ? 'Completed' : booking.status}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Weekly Pattern */}
                    {allBookings.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Weekly Workout Pattern
                        </h3>
                        <div className="grid grid-cols-7 gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                            const dayBookings = allBookings.filter(booking => {
                              const bookingDay = new Date(booking.session.date).getDay()
                              return bookingDay === (index + 1) % 7 // Adjust for Monday start
                            })
                            const intensity = Math.min(dayBookings.length / Math.max(allBookings.length / 7, 1), 1)
                            
                            return (
                              <div key={day} className="text-center">
                                <p className="text-xs font-medium text-gray-600 mb-2">{day}</p>
                                <div 
                                  className={`h-16 rounded-lg border-2 flex items-end justify-center pb-2 ${
                                    intensity > 0.7 ? 'bg-blue-500 border-blue-600' :
                                    intensity > 0.4 ? 'bg-blue-300 border-blue-400' :
                                    intensity > 0.1 ? 'bg-blue-200 border-blue-300' :
                                    'bg-gray-100 border-gray-200'
                                  }`}
                                >
                                  <span className={`text-xs font-bold ${
                                    intensity > 0.4 ? 'text-white' : 'text-gray-600'
                                  }`}>
                                    {dayBookings.length}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Workout frequency by day of week (total sessions)
                        </p>
                      </div>
                    )}

                    {/* Time Preferences */}
                    {allBookings.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Preferred Workout Times
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { label: 'Morning', range: '6-10 AM', hours: [6, 7, 8, 9] },
                            { label: 'Midday', range: '10-2 PM', hours: [10, 11, 12, 13] },
                            { label: 'Afternoon', range: '2-6 PM', hours: [14, 15, 16, 17] },
                            { label: 'Evening', range: '6-10 PM', hours: [18, 19, 20, 21] }
                          ].map(timeSlot => {
                            const count = allBookings.filter(booking => {
                              const hour = parseInt(booking.session.startTime.split(':')[0])
                              return timeSlot.hours.includes(hour)
                            }).length
                            const percentage = allBookings.length > 0 ? (count / allBookings.length * 100) : 0
                            
                            return (
                              <div key={timeSlot.label} className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="font-semibold text-blue-900">{timeSlot.label}</p>
                                <p className="text-xs text-blue-600 mb-2">{timeSlot.range}</p>
                                <p className="text-lg font-bold text-blue-800">{count}</p>
                                <p className="text-xs text-blue-600">{Math.round(percentage)}%</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* View Full History Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <Button 
                        onClick={() => router.push("/dashboard/history")}
                        variant="outline"
                        className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 font-medium"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Complete History & Detailed Analytics
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

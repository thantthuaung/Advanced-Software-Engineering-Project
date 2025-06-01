"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Settings, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut,
  Shield,
  Crown,
  Edit,
  Trash2,
  User,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff
} from "lucide-react"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  student_id: string
  role: string
  membership_type: string
  status: string
  created_at: string
  approval_date?: string
  expiry_date: string
  payment_status: string
  payment_method: string
  payment_amount: number
}

interface BillingTransaction {
  id: string
  userId: string
  transactionType: string
  amount: number
  currency: string
  paymentMethod: string
  paymentReference: string
  description: string
  status: string
  processedBy: string
  processedAt: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    studentId: string
    membershipType: string
    expiryDate: string
    paymentStatus: string
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [billingTransactions, setBillingTransactions] = useState<BillingTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sessionAnalytics, setSessionAnalytics] = useState<any[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false)
  const [showModifyCapacityModal, setShowModifyCapacityModal] = useState(false)
  const [showSessionListModal, setShowSessionListModal] = useState(false)
  const [showEditSessionModal, setShowEditSessionModal] = useState(false)
  
  // Session management state
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [editingSession, setEditingSession] = useState<any>(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [weeklyLoading, setWeeklyLoading] = useState(false)
  
  // Admin profile state
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [emailChangeData, setEmailChangeData] = useState({
    currentPassword: "",
    newEmail: "",
    showPassword: false
  })
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  })
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false)
  
  const [newSession, setNewSession] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
    type: "general",
    instructor: "Self-guided",
    description: "Open gym access"
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Fetch billing transactions
      const billingResponse = await fetch('/api/admin/billing')
      if (billingResponse.ok) {
        const billingData = await billingResponse.json()
        setBillingTransactions(Array.isArray(billingData) ? billingData : [])
      }

      // Fetch session analytics
      const analyticsResponse = await fetch('/api/admin/analytics')
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        
        // Convert analytics object to array of analytics cards
        const analyticsCards = [
          {
            id: 'peak-hours',
            title: 'Peak Hours',
            description: 'Most popular time slots',
            value: analyticsData.peakHours?.[0]?.time || 'No data',
            details: `${analyticsData.peakHours?.[0]?.bookings || 0} bookings`
          },
          {
            id: 'weekly-utilization',
            title: 'Weekly Utilization',
            description: 'Overall gym usage',
            value: `${analyticsData.weeklyStats?.utilization || 0}%`,
            details: `${analyticsData.weeklyStats?.totalBookings || 0} bookings this week`
          },
          {
            id: 'session-count',
            title: 'Active Sessions',
            description: 'Total sessions this week',
            value: analyticsData.weeklyStats?.totalSessions || 0,
            details: `${analyticsData.monthlyTrends?.averageDaily || 0} avg daily`
          },
          {
            id: 'user-stats',
            title: 'Active Users',
            description: 'Approved members',
            value: analyticsData.userStats?.activeUsers || 0,
            details: `${analyticsData.userStats?.pendingApprovals || 0} pending approval`
          }
        ]
        
        setSessionAnalytics(analyticsCards)
      }

      // Fetch sessions for today by default
      await fetchSessions(new Date().toISOString().split('T')[0])
      
      // Fetch weekly overview data
      await loadWeeklyOverview()
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async (date: string) => {
    try {
      setSessionLoading(true)
      const response = await fetch(`/api/admin/sessions?date=${date}`)
      if (response.ok) {
        const sessionsData = await response.json()
        setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setSessionLoading(false)
    }
  }

  const fetchWeekOverview = async () => {
    try {
      setWeeklyLoading(true)
      const weekDays = []
      const today = new Date()
      const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
      
      for (let i = 0; i < 5; i++) {
        const day = new Date(monday)
        day.setDate(monday.getDate() + i)
        const dateString = day.toISOString().split('T')[0]
        
        const response = await fetch(`/api/admin/sessions?date=${dateString}`)
        if (response.ok) {
          const sessionsData = await response.json()
          const totalCapacity = sessionsData.reduce((sum: number, session: any) => sum + session.capacity, 0)
          const totalBookings = sessionsData.reduce((sum: number, session: any) => sum + session.current_bookings, 0)
          const utilization = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0
          
          weekDays.push({
            day: day.toLocaleDateString('en-US', { weekday: 'long' }),
            date: dateString,
            sessions: sessionsData.length,
            utilization: utilization,
            available: sessionsData.filter((s: any) => s.current_bookings < s.capacity).length,
            totalCapacity,
            totalBookings
          })
        }
      }
      
      return weekDays
    } catch (error) {
      console.error('Error fetching week overview:', error)
      return []
    } finally {
      setWeeklyLoading(false)
    }
  }

  const loadWeeklyOverview = async () => {
    const weekData = await fetchWeekOverview()
    setWeeklyData(weekData)
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Suspended</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>
    }
  }

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Expired</Badge>
    } else if (daysUntilExpiry <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Expiring Soon</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    const matchesSearch = searchTerm === "" || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'approved').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    totalRevenue: billingTransactions.reduce((sum, t) => sum + t.amount, 0)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        alert('User deleted successfully')
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleSuspendUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'approved' : 'suspended'
    const action = newStatus === 'suspended' ? 'suspend' : 'unsuspend'
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          updates: { status: newStatus }
        })
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? {...u, status: newStatus} : u))
        alert(`User ${action}ed successfully`)
      } else {
        alert(`Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      alert(`Error ${action}ing user`)
    }
  }

  const handleUpdateUser = async (updates: any) => {
    if (!editingUser) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          updates: updates
        })
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? {...u, ...updates} : u))
        setShowEditModal(false)
        setEditingUser(null)
        alert('User updated successfully')
        fetchData() // Refresh data
      } else {
        alert('Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    }
  }

  const handleApproveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to approve this user?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          action: 'approve'
        })
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? {...u, status: 'approved', approval_date: new Date().toISOString()} : u))
        alert('User approved successfully')
      } else {
        alert('Failed to approve user')
      }
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Error approving user')
    }
  }

  const handleDeclineUser = async (userId: string) => {
    if (!confirm('Are you sure you want to decline this user? This will suspend their account.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          action: 'reject'
        })
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? {...u, status: 'suspended'} : u))
        alert('User declined successfully')
      } else {
        alert('Failed to decline user')
      }
    } catch (error) {
      console.error('Error declining user:', error)
      alert('Error declining user')
    }
  }

  const handleCreateSession = async () => {
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          sessionData: newSession
        })
      })

      if (response.ok) {
        alert('Session created successfully')
        setShowCreateSessionModal(false)
        setNewSession({
          date: "",
          startTime: "",
          endTime: "",
          capacity: "",
          type: "general",
          instructor: "Self-guided",
          description: "Open gym access"
        })
        // Refresh sessions if the created session is for the selected date
        if (newSession.date === selectedDate) {
          await fetchSessions(selectedDate)
        }
        // Refresh weekly overview
        await loadWeeklyOverview()
      } else {
        alert('Failed to create session')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Error creating session')
    }
  }

  const handleUpdateSession = async () => {
    if (!editingSession) return
    
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: editingSession.id,
          updates: {
            date: editingSession.date,
            startTime: editingSession.start_time,
            endTime: editingSession.end_time,
            capacity: parseInt(editingSession.capacity),
            type: editingSession.type,
            instructor: editingSession.instructor,
            description: editingSession.description
          }
        })
      })

      if (response.ok) {
        alert('Session updated successfully')
        setShowEditSessionModal(false)
        setEditingSession(null)
        await fetchSessions(selectedDate)
        // Refresh weekly overview
        await loadWeeklyOverview()
      } else {
        alert('Failed to update session')
      }
    } catch (error) {
      console.error('Error updating session:', error)
      alert('Error updating session')
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This will cancel all bookings.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/sessions?sessionId=${sessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Session deleted successfully')
        await fetchSessions(selectedDate)
        // Refresh weekly overview
        await loadWeeklyOverview()
      } else {
        alert('Failed to delete session')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Error deleting session')
    }
  }

  const handleEditSession = (session: any) => {
    setEditingSession(session)
    setShowEditSessionModal(true)
  }

  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    await fetchSessions(date)
  }

  const handleEmailChange = async () => {
    if (!emailChangeData.currentPassword || !emailChangeData.newEmail) {
      alert('Please fill in all fields')
      return
    }

    if (!emailChangeData.newEmail.endsWith('@my.jcu.edu.au')) {
      alert('Please use a valid JCU email address')
      return
    }

    setProfileUpdateLoading(true)
    
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'email',
          currentPassword: emailChangeData.currentPassword,
          newEmail: emailChangeData.newEmail
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Email updated successfully!')
        setShowEmailChangeModal(false)
        setEmailChangeData({ currentPassword: "", newEmail: "", showPassword: false })
        
        // Update user data in localStorage and state
        const userData = JSON.parse(localStorage.getItem('user-data') || '{}')
        userData.email = result.newEmail
        localStorage.setItem('user-data', JSON.stringify(userData))
        
        // Refresh the page to update the UI
        window.location.reload()
      } else {
        alert(result.error || 'Failed to update email')
      }
    } catch (error) {
      console.error('Error updating email:', error)
      alert('An error occurred while updating email')
    } finally {
      setProfileUpdateLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordChangeData.currentPassword || !passwordChangeData.newPassword || !passwordChangeData.confirmPassword) {
      alert('Please fill in all fields')
      return
    }

    if (passwordChangeData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    setProfileUpdateLoading(true)
    
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'password',
          currentPassword: passwordChangeData.currentPassword,
          newPassword: passwordChangeData.newPassword
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Password updated successfully!')
        setShowPasswordChangeModal(false)
        setPasswordChangeData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false
        })
      } else {
        alert(result.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Error updating password:', error)
      alert('An error occurred while updating password')
    } finally {
      setProfileUpdateLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/90 backdrop-blur-lg border-b border-amber-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* JCU Official Logo */}
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg p-1">
                <svg viewBox="0 0 200 150" className="w-full h-full">
                  {/* JCU Logo Recreation */}
                  <defs>
                    <linearGradient id="sunGradientAdminDash" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B"/>
                      <stop offset="100%" stopColor="#D97706"/>
                    </linearGradient>
                    <linearGradient id="waveGradientAdminDash" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB"/>
                      <stop offset="100%" stopColor="#1D4ED8"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Sun */}
                  <circle cx="150" cy="30" r="18" fill="url(#sunGradientAdminDash)"/>
                  <path d="M150,5 L155,20 L170,15 L160,25 L175,30 L160,35 L170,45 L155,40 L150,55 L145,40 L130,45 L140,35 L125,30 L140,25 L130,15 L145,20 Z" fill="url(#sunGradientAdminDash)"/>
                  
                  {/* Ocean Waves */}
                  <path d="M10,60 Q50,45 90,60 T170,60 L170,90 Q130,75 90,90 T10,90 Z" fill="url(#waveGradientAdminDash)"/>
                  <path d="M10,80 Q50,65 90,80 T170,80 L170,110 Q130,95 90,110 T10,110 Z" fill="url(#waveGradientAdminDash)" opacity="0.8"/>
                  <path d="M10,100 Q50,85 90,100 T170,100 L170,130 Q130,115 90,130 T10,130 Z" fill="url(#waveGradientAdminDash)" opacity="0.6"/>
                  
                  {/* JCU Letters */}
                  <text x="20" y="45" fontSize="24" fontWeight="bold" fill="#1F2937">JCU</text>
                </svg>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-300">JCU Fitness Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-300">{user?.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-amber-500/30">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-amber-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-amber-600">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-white data-[state=active]:bg-amber-600">
              <Calendar className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-white data-[state=active]:bg-amber-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-amber-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-amber-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-amber-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Active Members</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-amber-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.pendingUsers}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-amber-500/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">S${stats.totalRevenue}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white">Recent User Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-300">{user.email}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(user.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <div className="flex space-x-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-slate-800/50 border-amber-500/30 text-white"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-slate-800/50 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="bg-slate-800/50 border-amber-500/30">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Membership</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expiry</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-700/30">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{user.first_name} {user.last_name}</div>
                              <div className="text-sm text-gray-300">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.student_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.membership_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm text-white">{user.expiry_date}</div>
                              {getExpiryStatus(user.expiry_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">S${user.payment_amount}</div>
                            <div className="text-xs text-gray-300">{user.payment_method}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              {user.status === 'pending' ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproveUser(user.id)}
                                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeclineUser(user.id)}
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditUser(user)}
                                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSuspendUser(user.id, user.status)}
                                    className={`border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 ${
                                      user.status === 'suspended' ? 'bg-yellow-500/20' : ''
                                    }`}
                                  >
                                    {user.status === 'suspended' ? (
                                      <UserCheck className="h-4 w-4" />
                                    ) : (
                                      <UserX className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id)}
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            {/* Session Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessionAnalytics.map((analytics) => (
                <Card key={analytics.id} className="bg-slate-800/50 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{analytics.title}</CardTitle>
                    <CardDescription className="text-gray-300">{analytics.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-amber-400">{analytics.value}</div>
                      <div className="text-sm text-gray-400">{analytics.details}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Session Management */}
            <Card className="bg-slate-800/50 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white">Session Management</CardTitle>
                <CardDescription className="text-gray-300">Manage gym session availability and capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setShowCreateSessionModal(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Time Slot
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                      onClick={() => setShowSessionListModal(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Sessions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                      onClick={fetchData}
                      disabled={loading}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                  
                  {/* Date Selector for Session View */}
                  <div className="flex items-center space-x-4">
                    <label className="text-white font-medium">View Sessions for:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2"
                    />
                    {sessionLoading && (
                      <div className="text-amber-400">Loading sessions...</div>
                    )}
                  </div>
                  
                  {/* Sessions for Selected Date */}
                  <div className="mt-6">
                    <h4 className="text-white font-semibold mb-3">
                      Sessions for {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <div className="space-y-2">
                      {sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          No sessions scheduled for this date
                        </div>
                      ) : (
                        sessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <span className="text-white font-medium">
                                  {session.start_time} - {session.end_time}
                                </span>
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                                  {session.type}
                                </Badge>
                                <span className="text-gray-300">{session.instructor}</span>
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                {session.description}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-white">
                                  {session.current_bookings}/{session.capacity} booked
                                </div>
                                <div className="text-sm text-gray-400">
                                  {Math.round((session.current_bookings / session.capacity) * 100)}% utilized
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                  onClick={() => handleEditSession(session)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                  onClick={() => handleDeleteSession(session.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Week Overview */}
            <Card className="bg-slate-800/50 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Weekly Overview
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                    onClick={loadWeeklyOverview}
                    disabled={weeklyLoading}
                  >
                    {weeklyLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-400"></div>
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                  </Button>
                </CardTitle>
                <CardDescription className="text-gray-300">Session utilization across the work week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {weeklyLoading ? (
                    <div className="text-center py-8 text-amber-400">Loading weekly data...</div>
                  ) : weeklyData.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No weekly data available</div>
                  ) : (
                    weeklyData.map((dayData) => (
                      <div key={dayData.day} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                        <span className="text-white font-medium">{dayData.day}</span>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className="text-green-400 text-sm">
                              {dayData.sessions} sessions
                            </span>
                            <div className="text-xs text-gray-400">
                              {dayData.available} available
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              dayData.utilization >= 80 ? 'text-red-400' : 
                              dayData.utilization >= 60 ? 'text-amber-400' : 'text-green-400'
                            }`}>
                              {dayData.utilization}% booked
                            </span>
                            <div className="text-xs text-gray-400">
                              {dayData.totalBookings}/{dayData.totalCapacity}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            onClick={() => handleDateChange(dayData.date)}
                          >
                            View Day
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Weekly Summary */}
                {weeklyData.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-amber-400">
                          {weeklyData.reduce((sum, day) => sum + day.sessions, 0)}
                        </div>
                        <div className="text-xs text-gray-400">Total Sessions</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">
                          {weeklyData.reduce((sum, day) => sum + day.totalBookings, 0)}
                        </div>
                        <div className="text-xs text-gray-400">Total Bookings</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">
                          {Math.round(
                            weeklyData.reduce((sum, day) => sum + day.utilization, 0) / weeklyData.length
                          )}%
                        </div>
                        <div className="text-xs text-gray-400">Avg Utilization</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Billing & Transactions</h2>
            
            <Card className="bg-slate-800/50 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingTransactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{transaction.user?.firstName} {transaction.user?.lastName}</p>
                        <p className="text-sm text-gray-300">{transaction.user?.email}</p>
                        <p className="text-xs text-gray-400">{transaction.paymentReference}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">S${transaction.amount}</p>
                        <p className="text-sm text-gray-300">{transaction.paymentMethod}</p>
                        <p className="text-xs text-gray-400">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
            
            {/* Admin Profile Management */}
            <Card className="bg-slate-800/50 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-amber-400" />
                  Admin Profile Management
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Update your admin account email and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setShowEmailChangeModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center h-12"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Change Email
                  </Button>
                  
                  <Button
                    onClick={() => setShowPasswordChangeModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center h-12"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Current Admin Email</p>
                      <p className="text-sm text-gray-300">{user?.email}</p>
                    </div>
                    <Shield className="h-5 w-5 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* System Settings */}
            <Card className="bg-slate-800/50 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
                <CardDescription className="text-gray-300">
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">System Status</p>
                    <p className="text-sm text-gray-300">All systems operational</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Database</p>
                    <p className="text-sm text-gray-300">Connected and synchronized</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Payment Processing</p>
                    <p className="text-sm text-gray-300">Payment gateway active</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Session Modal */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Time Slot</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                    className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                    className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Capacity</label>
                <input
                  type="number"
                  value={newSession.capacity}
                  onChange={(e) => setNewSession({...newSession, capacity: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select
                  value={newSession.type}
                  onChange={(e) => setNewSession({...newSession, type: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="class">Class</option>
                  <option value="personal-training">Personal Training</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateSessionModal(false)}
                className="border-gray-500 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={editingUser.first_name}
                  onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editingUser.last_name}
                  onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Membership Type</label>
                <select
                  value={editingUser.membership_type}
                  onChange={(e) => setEditingUser({...editingUser, membership_type: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                >
                  <option value="1-trimester">1 Trimester</option>
                  <option value="3-trimester">3 Trimester</option>
                  <option value="1-year">1 Year</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="border-gray-500 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateUser({
                  first_name: editingUser.first_name,
                  last_name: editingUser.last_name,
                  email: editingUser.email,
                  membership_type: editingUser.membership_type
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-lg border border-amber-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-amber-400" />
              Change Admin Email
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={emailChangeData.showPassword ? "text" : "password"}
                    value={emailChangeData.currentPassword}
                    onChange={(e) => setEmailChangeData({...emailChangeData, currentPassword: e.target.value})}
                    className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setEmailChangeData({...emailChangeData, showPassword: !emailChangeData.showPassword})}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    {emailChangeData.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Email</label>
                <input
                  type="email"
                  value={emailChangeData.newEmail}
                  onChange={(e) => setEmailChangeData({...emailChangeData, newEmail: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                  placeholder="new.admin@my.jcu.edu.au"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmailChangeModal(false)
                  setEmailChangeData({ currentPassword: "", newEmail: "", showPassword: false })
                }}
                className="border-gray-500 text-gray-300"
                disabled={profileUpdateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEmailChange}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={profileUpdateLoading}
              >
                {profileUpdateLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  "Update Email"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-lg border border-amber-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2 text-amber-400" />
              Change Admin Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={passwordChangeData.showCurrentPassword ? "text" : "password"}
                    value={passwordChangeData.currentPassword}
                    onChange={(e) => setPasswordChangeData({...passwordChangeData, currentPassword: e.target.value})}
                    className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordChangeData({...passwordChangeData, showCurrentPassword: !passwordChangeData.showCurrentPassword})}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    {passwordChangeData.showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={passwordChangeData.showNewPassword ? "text" : "password"}
                    value={passwordChangeData.newPassword}
                    onChange={(e) => setPasswordChangeData({...passwordChangeData, newPassword: e.target.value})}
                    className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white pr-10"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordChangeData({...passwordChangeData, showNewPassword: !passwordChangeData.showNewPassword})}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    {passwordChangeData.showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={passwordChangeData.showConfirmPassword ? "text" : "password"}
                    value={passwordChangeData.confirmPassword}
                    onChange={(e) => setPasswordChangeData({...passwordChangeData, confirmPassword: e.target.value})}
                    className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordChangeData({...passwordChangeData, showConfirmPassword: !passwordChangeData.showConfirmPassword})}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    {passwordChangeData.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordChangeModal(false)
                  setPasswordChangeData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    showCurrentPassword: false,
                    showNewPassword: false,
                    showConfirmPassword: false
                  })
                }}
                className="border-gray-500 text-gray-300"
                disabled={profileUpdateLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={profileUpdateLoading}
              >
                {profileUpdateLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditSessionModal && editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-lg border border-amber-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Edit className="h-5 w-5 mr-2 text-amber-400" />
              Edit Session
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={editingSession.date}
                  onChange={(e) => setEditingSession({...editingSession, date: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingSession.start_time}
                    onChange={(e) => setEditingSession({...editingSession, start_time: e.target.value})}
                    className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingSession.end_time}
                    onChange={(e) => setEditingSession({...editingSession, end_time: e.target.value})}
                    className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Capacity</label>
                <input
                  type="number"
                  value={editingSession.capacity}
                  onChange={(e) => setEditingSession({...editingSession, capacity: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select
                  value={editingSession.type}
                  onChange={(e) => setEditingSession({...editingSession, type: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="class">Class</option>
                  <option value="personal-training">Personal Training</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Instructor</label>
                <input
                  type="text"
                  value={editingSession.instructor || ''}
                  onChange={(e) => setEditingSession({...editingSession, instructor: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white"
                  placeholder="Self-guided"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingSession.description || ''}
                  onChange={(e) => setEditingSession({...editingSession, description: e.target.value})}
                  className="w-full p-2 bg-slate-700 border border-gray-600 rounded text-white h-20"
                  placeholder="Session description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditSessionModal(false)
                  setEditingSession(null)
                }}
                className="border-gray-500 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSession}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Session List Modal */}
      {showSessionListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-4/5 max-w-4xl max-h-[90vh] overflow-y-auto border border-amber-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-amber-400" />
              All Sessions Management
            </h3>
            
            {/* Date Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <label className="text-white font-medium">Filter by Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2"
              />
              <Button
                onClick={() => setShowSessionListModal(false)}
                variant="outline"
                className="border-gray-500 text-gray-300 ml-auto"
              >
                Close
              </Button>
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              {sessionLoading ? (
                <div className="text-center py-8 text-amber-400">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No sessions found for {new Date(selectedDate).toLocaleDateString()}
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-white font-medium text-lg">
                            {session.start_time} - {session.end_time}
                          </span>
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            {session.type}
                          </Badge>
                          <span className="text-gray-300">{session.instructor}</span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          {session.description}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-400">
                            Capacity: {session.capacity}
                          </span>
                          <span className="text-amber-400">
                            Booked: {session.current_bookings}
                          </span>
                          <span className="text-blue-400">
                            Available: {session.capacity - session.current_bookings}
                          </span>
                          <span className="text-purple-400">
                            Utilization: {Math.round((session.current_bookings / session.capacity) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          onClick={() => {
                            setShowSessionListModal(false)
                            handleEditSession(session)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
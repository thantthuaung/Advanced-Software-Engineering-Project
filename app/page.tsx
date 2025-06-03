"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Users, 
  Trophy,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  Waves,
  Sun,
  Target,
  TrendingUp,
  Heart,
  User,
  Shield
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-900 text-lg font-semibold">Loading JCU Fitness...</p>
        </div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 relative overflow-hidden">
      {/* Ocean Wave Background */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 1200 800" className="w-full h-full absolute inset-0">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1"/>
              <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.05"/>
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <path d="M0,400 C300,350 600,450 900,380 C1050,340 1150,420 1200,400 L1200,800 L0,800 Z" fill="url(#waveGradient)"/>
          <path d="M0,500 C200,480 400,520 600,500 C800,480 1000,520 1200,500 L1200,800 L0,800 Z" fill="url(#waveGradient)" opacity="0.6"/>
          <path d="M0,600 C150,590 350,610 550,600 C750,590 950,610 1200,600 L1200,800 L0,800 Z" fill="url(#waveGradient)" opacity="0.3"/>
        </svg>
      </div>

      {/* Sun Element */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl opacity-80">
        <Sun className="h-16 w-16 text-white" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full animate-pulse opacity-50"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-blue-200">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* JCU Official Logo */}
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg p-1.5">
                  <svg viewBox="0 0 200 150" className="w-full h-full">
                    {/* JCU Logo Recreation */}
                    <defs>
                      <linearGradient id="sunGradientHome" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B"/>
                        <stop offset="100%" stopColor="#D97706"/>
                      </linearGradient>
                      <linearGradient id="waveGradientHome" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563EB"/>
                        <stop offset="100%" stopColor="#1D4ED8"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Sun */}
                    <circle cx="150" cy="30" r="18" fill="url(#sunGradientHome)"/>
                    <path d="M150,5 L155,20 L170,15 L160,25 L175,30 L160,35 L170,45 L155,40 L150,55 L145,40 L130,45 L140,35 L125,30 L140,25 L130,15 L145,20 Z" fill="url(#sunGradientHome)"/>
                    
                    {/* Ocean Waves */}
                    <path d="M10,60 Q50,45 90,60 T170,60 L170,90 Q130,75 90,90 T10,90 Z" fill="url(#waveGradientHome)"/>
                    <path d="M10,80 Q50,65 90,80 T170,80 L170,110 Q130,95 90,110 T10,110 Z" fill="url(#waveGradientHome)" opacity="0.8"/>
                    <path d="M10,100 Q50,85 90,100 T170,100 L170,130 Q130,115 90,130 T10,130 Z" fill="url(#waveGradientHome)" opacity="0.6"/>
                    
                    {/* JCU Letters */}
                    <text x="20" y="45" fontSize="24" fontWeight="bold" fill="#1F2937">JCU</text>
                  </svg>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-blue-900 leading-tight">JAMES COOK UNIVERSITY</h1>
                  <p className="text-sm font-semibold text-blue-700">SINGAPORE FITNESS CENTER</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                  asChild
                >
                  <Link href="/auth/login">
                    <User className="h-5 w-5 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button 
                  onClick={() => router.push("/auth/register")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-4 py-2">
                    <Waves className="h-4 w-4 mr-2" />
                    University Excellence
                  </Badge>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-blue-900 leading-tight">
                  Transform Your
                  <span className="text-amber-600 block">
                    Fitness Journey
                  </span>
                  <span className="text-blue-700 block text-4xl lg:text-5xl">
                    at JCU Singapore
                  </span>
                </h1>
                
                <p className="text-xl text-gray-700 leading-relaxed max-w-lg">
                  Experience our state-of-the-art fitness facility with smart booking, 
                  achievement tracking, and a supportive university community designed for your success.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={() => router.push("/auth/register")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg h-14 px-8 shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/auth/login")}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 h-14 px-8 font-semibold"
                >
                  Try Demo Account
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-blue-900">500+</h3>
                  <p className="text-blue-700 font-semibold">Active Members</p>
                </div>
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-blue-900">24/7</h3>
                  <p className="text-blue-700 font-semibold">Access Available</p>
                </div>
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-blue-900">100%</h3>
                  <p className="text-blue-700 font-semibold">Student Focused</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {/* Feature Cards */}
                  <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                      <h4 className="text-blue-900 font-bold mb-2">Smart Booking</h4>
                      <p className="text-blue-700 text-sm font-medium">Real-time session scheduling</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-50 border-amber-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <Trophy className="h-10 w-10 text-amber-600 mx-auto mb-3" />
                      <h4 className="text-amber-900 font-bold mb-2">Achievements</h4>
                      <p className="text-amber-700 text-sm font-medium">Track your progress</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <Users className="h-10 w-10 text-green-600 mx-auto mb-3" />
                      <h4 className="text-green-900 font-bold mb-2">Community</h4>
                      <p className="text-green-700 text-sm font-medium">Connect with peers</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <Heart className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                      <h4 className="text-purple-900 font-bold mb-2">Wellness</h4>
                      <p className="text-purple-700 text-sm font-medium">Holistic health focus</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 p-4 bg-blue-600 rounded-2xl shadow-2xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 p-4 bg-amber-500 rounded-2xl shadow-2xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white/60 backdrop-blur-sm py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-6">
                Everything You Need for
                <span className="text-amber-600"> University Fitness Success</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Our comprehensive fitness platform is designed specifically for the JCU Singapore community
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="p-3 bg-blue-600 rounded-lg w-fit">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-blue-900 text-xl">Smart Session Booking</CardTitle>
                  <CardDescription className="text-gray-700">
                    Advanced booking system with real-time availability, waitlists, and automatic notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Real-time availability</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Waitlist management</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Automatic reminders</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="p-3 bg-amber-600 rounded-lg w-fit">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-amber-900 text-xl">Achievement System</CardTitle>
                  <CardDescription className="text-gray-700">
                    Gamified fitness tracking with points, streaks, and milestone rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Progress tracking</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Streak maintenance</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Milestone rewards</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="p-3 bg-green-600 rounded-lg w-fit">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-green-900 text-xl">University Integration</CardTitle>
                  <CardDescription className="text-gray-700">
                    Seamlessly integrated with JCU student systems and academic calendar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Student ID integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Academic schedule sync</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-gray-700 font-medium">Campus-wide notifications</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-blue-200 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg mr-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-bold text-blue-900">Ready to Join JCU Fitness?</h2>
                <p className="text-blue-700 font-semibold">Your university wellness journey starts here</p>
              </div>
            </div>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Join hundreds of JCU Singapore students and staff who have transformed their fitness routine with our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => router.push("/auth/register")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg h-14 px-8 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                Get Started Today
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => router.push("/auth/login")}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 h-14 px-8 font-semibold"
              >
                Login
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-blue-900 text-white py-12">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg mr-4">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">JAMES COOK UNIVERSITY</h3>
                  <p className="text-blue-200 font-semibold">SINGAPORE FITNESS CENTER</p>
                </div>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full mb-4"></div>
              <p className="text-blue-200">
                © {new Date().getFullYear()} James Cook University Singapore. All rights reserved.
              </p>
              <p className="text-blue-300 text-sm mt-2">
                Fitness Center Management System - Empowering Student Wellness
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

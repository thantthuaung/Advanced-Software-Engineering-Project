"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, User, Lock, Eye, EyeOff, Waves, Sun } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(email, password)
      
      if (result.success) {
        // Successful login - redirect based on user role
        if (result.user?.role === 'admin') {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        // Handle different error statuses
        switch (result.status) {
          case 'pending':
            // Redirect to pending approval page with user info
            const userInfoQuery = encodeURIComponent(JSON.stringify(result.userInfo))
            router.push(`/auth/pending?userInfo=${userInfoQuery}`)
            break
            
          case 'suspended':
            setError(`Account suspended: ${result.message} Please contact ${result.userInfo || 'support@fitness.jcu.edu.au'} for assistance.`)
            break
            
          case 'expired':
            setError(`Membership expired: ${result.message} Please contact support to renew your membership.`)
            break
            
          case 'unknown':
            setError(`Account issue: ${result.message} Please contact ${result.userInfo || 'support@fitness.jcu.edu.au'} for assistance.`)
            break
            
          default:
            setError(result.message || "Invalid email or password")
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ocean Wave Background */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 1200 800" className="w-full h-full absolute inset-0">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          <path d="M0,400 C300,350 600,450 900,380 C1050,340 1150,420 1200,400 L1200,800 L0,800 Z" fill="url(#waveGradient)"/>
          <path d="M0,500 C200,480 400,520 600,500 C800,480 1000,520 1200,500 L1200,800 L0,800 Z" fill="url(#waveGradient)" opacity="0.5"/>
        </svg>
      </div>

      {/* Sun Icon */}
      <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg opacity-60">
        <Sun className="h-12 w-12 text-white" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* JCU Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            {/* JCU Official Logo */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl mr-4 p-2">
              <svg viewBox="0 0 200 150" className="w-full h-full">
                {/* JCU Logo Recreation */}
                <defs>
                  <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B"/>
                    <stop offset="100%" stopColor="#D97706"/>
                  </linearGradient>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="100%" stopColor="#1D4ED8"/>
                  </linearGradient>
                </defs>
                
                {/* Sun */}
                <circle cx="150" cy="30" r="18" fill="url(#sunGradient)"/>
                <path d="M150,5 L155,20 L170,15 L160,25 L175,30 L160,35 L170,45 L155,40 L150,55 L145,40 L130,45 L140,35 L125,30 L140,25 L130,15 L145,20 Z" fill="url(#sunGradient)"/>
                
                {/* Ocean Waves */}
                <path d="M10,60 Q50,45 90,60 T170,60 L170,90 Q130,75 90,90 T10,90 Z" fill="url(#waveGradient)"/>
                <path d="M10,80 Q50,65 90,80 T170,80 L170,110 Q130,95 90,110 T10,110 Z" fill="url(#waveGradient)" opacity="0.8"/>
                <path d="M10,100 Q50,85 90,100 T170,100 L170,130 Q130,115 90,130 T10,130 Z" fill="url(#waveGradient)" opacity="0.6"/>
                
                {/* JCU Letters */}
                <text x="20" y="45" fontSize="24" fontWeight="bold" fill="#1F2937">JCU</text>
              </svg>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-xl mr-4">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-blue-900">JAMES COOK</h1>
              <h2 className="text-xl font-bold text-blue-900">UNIVERSITY</h2>
              <p className="text-blue-700 font-semibold text-sm">SINGAPORE</p>
            </div>

          </div>
          <div className="w-full h-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-full mb-2"></div>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
            <div className="w-8 h-1 bg-blue-500 rounded-full"></div>
            <div className="w-8 h-1 bg-blue-400 rounded-full"></div>
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Fitness Center</h3>
          <p className="text-blue-600 font-medium">Student Portal Access</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-blue-200">
          <CardHeader className="space-y-1 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center justify-center mb-3">
              <User className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-blue-100">
              Sign in to access your fitness account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-900 font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@jcu.edu.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-900 font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-600" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-300 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold text-lg shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-blue-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="font-semibold text-blue-700 hover:text-blue-800 underline">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-600">
          <p className="text-sm font-medium">© {new Date().getFullYear()} James Cook University Singapore</p>
          <p className="text-xs">Fitness Center Management System</p>
        </div>
      </div>
    </div>
  )
}


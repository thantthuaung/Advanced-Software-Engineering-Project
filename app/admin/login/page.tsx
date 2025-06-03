"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, User, Lock, Eye, EyeOff, Settings, Crown } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
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
      const success = await login(email, password)
      
      if (success) {
        // Check if user is actually an admin
        const userStr = localStorage.getItem('user-data')
        
        if (userStr) {
          const user = JSON.parse(userStr)
          
          if (user.role === 'admin') {
            router.push("/admin")
          } else {
            setError("Access denied. Admin credentials required.")
            // Clear non-admin user
            localStorage.removeItem('user-data')
            localStorage.removeItem('auth-token')
          }
        } else {
          setError("Authentication failed")
        }
      } else {
        setError("Invalid admin credentials")
      }
    } catch (err) {
      console.error('Login error:', err)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff" fillOpacity="0.05">
                <circle cx="30" cy="30" r="2"/>
              </g>
            </g>
          </svg>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 to-transparent"></div>
      </div>

      {/* Admin Crown Icon */}
      <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl opacity-80">
        <Crown className="h-8 w-8 text-white" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            {/* JCU Official Logo */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl mr-4 p-2">
              <svg viewBox="0 0 200 150" className="w-full h-full">
                {/* JCU Logo Recreation */}
                <defs>
                  <linearGradient id="sunGradientAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B"/>
                    <stop offset="100%" stopColor="#D97706"/>
                  </linearGradient>
                  <linearGradient id="waveGradientAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="100%" stopColor="#1D4ED8"/>
                  </linearGradient>
                </defs>
                
                {/* Sun */}
                <circle cx="150" cy="30" r="18" fill="url(#sunGradientAdmin)"/>
                <path d="M150,5 L155,20 L170,15 L160,25 L175,30 L160,35 L170,45 L155,40 L150,55 L145,40 L130,45 L140,35 L125,30 L140,25 L130,15 L145,20 Z" fill="url(#sunGradientAdmin)"/>
                
                {/* Ocean Waves */}
                <path d="M10,60 Q50,45 90,60 T170,60 L170,90 Q130,75 90,90 T10,90 Z" fill="url(#waveGradientAdmin)"/>
                <path d="M10,80 Q50,65 90,80 T170,80 L170,110 Q130,95 90,110 T10,110 Z" fill="url(#waveGradientAdmin)" opacity="0.8"/>
                <path d="M10,100 Q50,85 90,100 T170,100 L170,130 Q130,115 90,130 T10,130 Z" fill="url(#waveGradientAdmin)" opacity="0.6"/>
                
                {/* JCU Letters */}
                <text x="20" y="45" fontSize="24" fontWeight="bold" fill="#1F2937">JCU</text>
              </svg>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center shadow-2xl mr-4 border-2 border-amber-500">
              <Shield className="h-10 w-10 text-amber-400" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">ADMIN</h1>
              <h2 className="text-xl font-bold text-amber-400">CONTROL PANEL</h2>
              <p className="text-gray-300 font-semibold text-sm">JCU FITNESS CENTER</p>
            </div>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-full mb-2"></div>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
            <div className="w-8 h-1 bg-yellow-500 rounded-full"></div>
            <div className="w-8 h-1 bg-amber-600 rounded-full"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">System Administration</h3>
          <p className="text-gray-300 font-medium">Authorized Personnel Only</p>
        </div>

        <Card className="bg-slate-800/95 backdrop-blur-lg shadow-2xl border border-amber-500/50">
          <CardHeader className="space-y-1 text-center bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg border-b border-amber-500/30">
            <div className="flex items-center justify-center mb-3">
              <Settings className="h-8 w-8 text-amber-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Administrator Access</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-semibold">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@my.jcu.edu.au"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-amber-500/50 focus:border-amber-400 focus:ring-amber-400 bg-slate-900/50 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-amber-500/50 focus:border-amber-400 focus:ring-amber-400 bg-slate-900/50 text-white placeholder-gray-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-amber-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-500 bg-red-900/50">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white h-12 font-semibold text-lg shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Admin Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-amber-600">
                Student?{" "}
                <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 underline">
                  Student Portal
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p className="text-sm font-medium">© {new Date().getFullYear()} James Cook University Singapore</p>
          <p className="text-xs">Administrative Access Portal</p>
        </div>
      </div>
    </div>
  )
}
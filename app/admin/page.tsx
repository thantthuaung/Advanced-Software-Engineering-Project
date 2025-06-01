"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/admin/login')
      return
    }
    
    if (user.role !== 'admin') {
      router.push('/auth/login')
      return
    }

    // Redirect to the new admin dashboard
    router.push('/admin/dashboard')
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-white text-xl">Redirecting to admin dashboard...</div>
    </div>
  )
}

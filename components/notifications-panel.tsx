"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, X, Star, Calendar, AlertTriangle, Info } from "lucide-react"
import type { Notification } from "@/lib/types"

interface NotificationsPanelProps {
  userId: string
  className?: string
}

export function NotificationsPanel({ userId, className }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/notifications?userId=${userId}`, { headers })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth-token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "mark_read", notificationId })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_reminder":
        return <Calendar className="h-4 w-4" />
      case "achievement":
        return <Star className="h-4 w-4" />
      case "waitlist_update":
        return <Bell className="h-4 w-4" />
      case "announcement":
        return <Info className="h-4 w-4" />
      case "system":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking_reminder":
        return "text-blue-700 bg-blue-100 border-blue-300"
      case "achievement":
        return "text-amber-700 bg-amber-100 border-amber-300"
      case "waitlist_update":
        return "text-green-700 bg-green-100 border-green-300"
      case "announcement":
        return "text-purple-700 bg-purple-100 border-purple-300"
      case "system":
        return "text-red-700 bg-red-100 border-red-300"
      default:
        return "text-gray-700 bg-gray-100 border-gray-300"
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Card className={`${className} bg-white shadow-lg border border-blue-100`}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6" />
            <span>Notifications</span>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-600 text-white border-red-700 font-semibold">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-blue-100 font-medium">Stay updated with your gym activities</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">No notifications yet</h3>
            <p className="text-blue-600 font-medium">You'll see important updates here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    notification.read 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-blue-50 border-blue-200 shadow-md"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full border ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-base font-bold ${notification.read ? "text-gray-700" : "text-blue-900"}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <p className={`text-sm mt-2 font-medium ${notification.read ? "text-gray-600" : "text-blue-700"}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm text-gray-500 font-medium">
                          {new Date(notification.createdAt).toLocaleDateString("en-AU", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                        
                        {notification.data?.achievementId && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-medium">
                            +{notification.data.points} points
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
} 
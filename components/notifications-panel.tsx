"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Megaphone, X, ExternalLink } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  action_url?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export function NotificationsPanel({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=50`, {
        credentials: 'include'
      })
      
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
      const response = await fetch(`/api/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notificationId,
          action: 'mark_read'
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notificationId,
          action: 'delete'
        })
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return AlertCircle
      case 'announcement': return Megaphone
      default: return Info
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 border-green-300'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'error': return 'text-red-600 bg-red-100 border-red-300'
      case 'announcement': return 'text-purple-600 bg-purple-100 border-purple-300'
      default: return 'text-blue-600 bg-blue-100 border-blue-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'normal': return 'bg-blue-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg border border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription className="text-blue-100">Stay updated with latest announcements</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600">Loading notifications...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg border border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white font-bold">
              {unreadCount} New
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-blue-100">Stay updated with latest announcements</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 mb-2">All caught up!</h3>
            <p className="text-blue-600">No notifications to show right now.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {notifications.map((notification) => {
                const TypeIcon = getTypeIcon(notification.type)
                const isUrgent = notification.priority === 'urgent'
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      !notification.is_read 
                        ? "bg-blue-50 border-blue-200 shadow-md" 
                        : "bg-gray-50 border-gray-200"
                    } ${isUrgent ? "ring-2 ring-red-400 ring-opacity-50" : ""}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`font-bold ${!notification.is_read ? "text-blue-900" : "text-gray-700"}`}>
                                {notification.title}
                              </h4>
                              {notification.priority !== 'normal' && (
                                <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority}
                                </Badge>
                              )}
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm ${!notification.is_read ? "text-blue-700" : "text-gray-600"} mb-2`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>
                                {new Date(notification.created_at).toLocaleDateString("en-AU", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                              {notification.is_read && notification.read_at && (
                                <span>
                                  Read {new Date(notification.read_at).toLocaleDateString("en-AU")}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {notification.action_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(notification.action_url, '_blank')}
                                className="text-xs px-2 py-1"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                            
                            {!notification.is_read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs px-2 py-1"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
        
        {unreadCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                notifications
                  .filter(n => !n.is_read)
                  .forEach(n => markAsRead(n.id))
              }}
              className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Mark All as Read ({unreadCount})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
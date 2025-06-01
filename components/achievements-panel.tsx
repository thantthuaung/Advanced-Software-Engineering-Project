"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Star, Target, Zap, Award } from "lucide-react"
import type { Achievement, UserAchievement } from "@/lib/types"

interface AchievementsPanelProps {
  userId: string
  className?: string
}

export function AchievementsPanel({ userId, className }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [userId])

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const [achievementsResponse, userAchievementsResponse] = await Promise.all([
        fetch("/api/achievements", { headers }),
        fetch(`/api/achievements?userId=${userId}`, { headers })
      ])

      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json()
        setAchievements(achievementsData)
      }

      if (userAchievementsResponse.ok) {
        const userAchievementsData = await userAchievementsResponse.json()
        setUserAchievements(userAchievementsData)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "attendance":
        return <Target className="h-5 w-5" />
      case "streak":
        return <Zap className="h-5 w-5" />
      case "milestone":
        return <Trophy className="h-5 w-5" />
      case "social":
        return <Star className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "attendance":
        return "text-blue-700 bg-blue-100 border-blue-300"
      case "streak":
        return "text-amber-700 bg-amber-100 border-amber-300"
      case "milestone":
        return "text-purple-700 bg-purple-100 border-purple-300"
      case "social":
        return "text-green-700 bg-green-100 border-green-300"
      default:
        return "text-gray-700 bg-gray-100 border-gray-300"
    }
  }

  const getRarityColor = (rarity: string, isCompleted: boolean) => {
    if (!isCompleted) return "text-gray-500 bg-gray-100 border-gray-300"
    
    switch (rarity) {
      case "common":
        return "text-green-700 bg-green-100 border-green-300"
      case "rare":
        return "text-blue-700 bg-blue-100 border-blue-300"
      case "epic":
        return "text-purple-700 bg-purple-100 border-purple-300"
      case "legendary":
        return "text-amber-700 bg-amber-100 border-amber-300"
      default:
        return "text-gray-700 bg-gray-100 border-gray-300"
    }
  }

  const completedCount = userAchievements.filter(ua => ua.isCompleted).length
  const totalPoints = achievements
    .filter(a => userAchievements.find(ua => ua.achievementId === a.id)?.isCompleted)
    .reduce((sum, a) => sum + a.points, 0)

  return (
    <Card className={`${className} bg-white shadow-lg border border-amber-100`}>
      <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6" />
            <span>Achievements</span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-white/20 text-white border-white/30 font-semibold">
              {completedCount}/{achievements.length}
            </Badge>
            <Badge className="bg-white text-amber-700 border-amber-300 font-semibold">
              {totalPoints} pts
            </Badge>
          </div>
        </CardTitle>
        <CardDescription className="text-amber-100 font-medium">Track your fitness milestones and progress</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-600 font-medium">Loading achievements...</p>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">No achievements yet</h3>
            <p className="text-amber-600 font-medium">Complete workouts to unlock achievements!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="text-2xl font-bold text-amber-900">{completedCount}</h3>
                <p className="text-amber-700 font-semibold">Completed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-2xl font-bold text-blue-900">{totalPoints}</h3>
                <p className="text-blue-700 font-semibold">Total Points</p>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {achievements.map((achievement) => {
                  const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
                  const progress = userAchievement?.progress || 0
                  const isCompleted = userAchievement?.isCompleted || false
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        isCompleted 
                          ? "bg-amber-50 border-amber-200 shadow-md" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full border ${getCategoryColor(achievement.category)}`}>
                          {getCategoryIcon(achievement.category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className={`text-base font-bold ${isCompleted ? "text-amber-900" : "text-gray-700"}`}>
                                {achievement.name}
                                {isCompleted && <span className="ml-2">🏆</span>}
                              </h4>
                              <p className={`text-sm font-medium ${isCompleted ? "text-amber-700" : "text-gray-600"}`}>
                                {achievement.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${getRarityColor(achievement.rarity, isCompleted)} font-medium`}>
                                {achievement.rarity}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800 border-green-300 font-medium">
                                +{achievement.points}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Progress</span>
                              <span className="text-sm font-semibold text-gray-700">{Math.round(progress)}%</span>
                            </div>
                            <Progress 
                              value={progress} 
                              className={`h-2 ${isCompleted ? "bg-amber-200" : "bg-gray-200"}`}
                            />
                          </div>
                          
                          {isCompleted && userAchievement?.unlockedAt && (
                            <p className="text-sm text-amber-600 font-medium mt-2">
                              Unlocked on {new Date(userAchievement.unlockedAt).toLocaleDateString("en-AU")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
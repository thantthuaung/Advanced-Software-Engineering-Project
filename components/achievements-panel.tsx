"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Calendar, Clock, Flame, Award, Lock } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  type: string
  progress?: number
  earned: boolean
  earned_at?: string
}

interface AchievementsData {
  earned: Achievement[]
  available: Achievement[]
  totalPoints: number
}

export function AchievementsPanel({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<AchievementsData>({
    earned: [],
    available: [],
    totalPoints: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchAchievements()
    }
  }, [userId])

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/achievements?userId=${userId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAchievements(data)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return Target
      case 'frequency': return Calendar
      case 'streak': return Flame
      case 'time': return Clock
      default: return Trophy
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'text-blue-600 bg-blue-100'
      case 'frequency': return 'text-green-600 bg-green-100'
      case 'streak': return 'text-orange-600 bg-orange-100'
      case 'time': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg border border-amber-100">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Achievements
          </CardTitle>
          <CardDescription className="text-amber-100">Your fitness milestones and rewards</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-600">Loading achievements...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg border border-amber-100">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Achievements
          </div>
          <Badge className="bg-white text-amber-600 font-bold">
            {achievements.totalPoints} Points
          </Badge>
        </CardTitle>
        <CardDescription className="text-amber-100">Your fitness milestones and rewards</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
            <Award className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-900">{achievements.earned.length}</p>
            <p className="text-amber-700 text-sm font-medium">Earned</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{achievements.available.length}</p>
            <p className="text-blue-700 text-sm font-medium">Available</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{achievements.totalPoints}</p>
            <p className="text-green-700 text-sm font-medium">Total Points</p>
          </div>
        </div>

        {/* Earned Achievements */}
        {achievements.earned.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Earned Achievements
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.earned.map((achievement) => {
                const TypeIcon = getTypeIcon(achievement.type)
                return (
                  <div key={achievement.id} className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white text-xl">
                          {achievement.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-amber-900">{achievement.name}</h4>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                            +{achievement.points}
                          </Badge>
                        </div>
                        <p className="text-amber-700 text-sm mb-2">{achievement.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getTypeColor(achievement.type)}`}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {achievement.type}
                          </Badge>
                          {achievement.earned_at && (
                            <span className="text-xs text-amber-600">
                              Earned {new Date(achievement.earned_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Achievements */}
        {achievements.available.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Available Achievements
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.available.map((achievement) => {
                const TypeIcon = getTypeIcon(achievement.type)
                const progress = achievement.progress || 0
                return (
                  <div key={achievement.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white text-xl opacity-60">
                          {achievement.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{achievement.name}</h4>
                          <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                            {achievement.points} pts
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress 
                            value={progress} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getTypeColor(achievement.type)}`}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {achievement.type}
                          </Badge>
                          {progress >= 100 && (
                            <span className="text-xs text-green-600 font-medium">
                              ✅ Ready to claim!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {achievements.earned.length === 0 && achievements.available.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Start Your Journey!</h3>
            <p className="text-amber-600">Complete gym sessions to unlock achievements and earn points.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
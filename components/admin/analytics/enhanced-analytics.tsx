"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from "recharts"
import { TrendingUp, Users, Target, Zap } from "lucide-react"

interface EcellForm {
  id: string
  name: string
}

interface AnalyticsData {
  questionId: string
  questionText: string
  questionType: string
  responses: { label: string; value: number; color?: string }[]
  totalResponses: number
}

const ECELL_COLORS = [
  "#FF8C32", "#FFA533", "#FFD233", "#FF6B6B", "#4ECDC4", 
  "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"
]

const INSIGHT_CARDS = [
  {
    title: "🔥 Hot Topics",
    description: "Most selected interests",
    icon: TrendingUp,
    color: "from-orange-500 to-red-500"
  },
  {
    title: "👥 Team Composition", 
    description: "Role distribution",
    icon: Users,
    color: "from-blue-500 to-purple-500"
  },
  {
    title: "🎯 Activity Preferences",
    description: "Event planning insights", 
    icon: Target,
    color: "from-green-500 to-teal-500"
  },
  {
    title: "🚀 Startup Readiness",
    description: "Interest vs experience",
    icon: Zap,
    color: "from-yellow-500 to-orange-500"
  }
]

export function EnhancedAnalytics({ forms }: { forms: EcellForm[] }) {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || "")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedFormId) return

    const fetchAnalytics = async () => {
      setLoading(true)
      const supabase = createClient()

      // Fetch questions and submissions with proper form filtering
      const [questionsResult, submissionsResult] = await Promise.all([
        supabase
          .from("ecell_questions")
          .select("*")
          .eq("form_id", selectedFormId)
          .order("order_number"),
        supabase
          .from("submissions")
          .select("id, email, answers, created_at")
          .eq("form_id", selectedFormId)
          .order("created_at", { ascending: false })
      ])

      if (questionsResult.error || submissionsResult.error) {
        console.error('Analytics fetch error:', questionsResult.error || submissionsResult.error)
        setLoading(false)
        return
      }

      const questions = questionsResult.data || []
      const submissions = submissionsResult.data || []

      // Process analytics data from JSON
      const analytics: AnalyticsData[] = questions
        .filter(q => ["single", "multiple"].includes(q.question_type))
        .map(question => {
          // Extract answers from submissions JSON
          const questionAnswers = submissions
            .map(s => s.answers[question.question_id])
            .filter(answer => answer !== undefined && answer !== null)
          
          // Count responses by value
          const responseCounts: Record<string, number> = {}
          
          questionAnswers.forEach(answer => {
            if (Array.isArray(answer)) {
              // Multiple choice - count each selected option
              answer.forEach(value => {
                responseCounts[value] = (responseCounts[value] || 0) + 1
              })
            } else {
              // Single choice - count the selected option
              responseCounts[answer] = (responseCounts[answer] || 0) + 1
            }
          })

          const chartData = Object.entries(responseCounts).map(([label, value], index) => ({
            label,
            value,
            color: ECELL_COLORS[index % ECELL_COLORS.length]
          }))

          return {
            questionId: question.question_id,
            questionText: question.question_text,
            questionType: question.question_type,
            responses: chartData,
            totalResponses: questionAnswers.length
          }
        })

      setAnalyticsData(analytics)
      
      // Generate insights
      const topInsights = analytics.slice(0, 4).map((data, index) => ({
        ...INSIGHT_CARDS[index],
        data: data.responses.slice(0, 3),
        total: data.totalResponses
      }))
      
      setInsights(topInsights)
      setLoading(false)
    }

    fetchAnalytics()
  }, [selectedFormId])

  if (forms.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No forms available for analytics
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📊 E-Cell Analytics Dashboard</CardTitle>
              <CardDescription>Deep insights into student interests and preferences</CardDescription>
            </div>
            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading analytics...</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Insight Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {insights.map((insight, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <insight.icon className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="secondary">{insight.total}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                    <div className="space-y-1 pt-2">
                      {insight.data.slice(0, 2).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="truncate">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {analyticsData.map((data) => (
              <Card key={data.questionId}>
                <CardHeader>
                  <CardTitle className="text-base">{data.questionText}</CardTitle>
                  <CardDescription>
                    {data.totalResponses} responses • {data.questionType === "single" ? "Single Choice" : "Multiple Choice"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.responses.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                      No responses yet
                    </div>
                  ) : data.questionType === "single" ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={data.responses}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {data.responses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data.responses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="label" 
                          className="text-xs" 
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {data.responses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
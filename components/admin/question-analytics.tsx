"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { EcellQuestion, Submission } from "@/lib/types"

interface QuestionAnalyticsProps {
  question: EcellQuestion
  responses: Submission[]
}

const COLORS = ['#FF8C32', '#FFA533', '#FFD233', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

export function QuestionAnalytics({ question, responses }: QuestionAnalyticsProps) {
  const analyticsData = useMemo(() => {
    const answers = responses
      .map(r => r.answers[question.question_id])
      .filter(answer => answer !== undefined && answer !== null && answer !== "")

    if (question.question_type === "single") {
      // Single choice - count each option
      const optionCounts: Record<string, number> = {}
      
      // Initialize with all options
      question.options?.forEach(option => {
        optionCounts[option.label] = 0
      })

      // Count actual responses
      answers.forEach(answer => {
        const option = question.options?.find(opt => opt.value === answer)
        if (option) {
          optionCounts[option.label]++
        }
      })

      return Object.entries(optionCounts)
        .filter(([_, count]) => count > 0)
        .map(([label, count]) => ({
          name: label,
          value: count,
          percentage: Math.round((count / answers.length) * 100)
        }))
    }

    if (question.question_type === "multiple") {
      // Multiple choice - count each selected option
      const optionCounts: Record<string, number> = {}
      
      // Initialize with all options
      question.options?.forEach(option => {
        optionCounts[option.label] = 0
      })

      // Count selections (answers are arrays)
      answers.forEach(answer => {
        if (Array.isArray(answer)) {
          answer.forEach(value => {
            const option = question.options?.find(opt => opt.value === value)
            if (option) {
              optionCounts[option.label]++
            }
          })
        }
      })

      return Object.entries(optionCounts)
        .filter(([_, count]) => count > 0)
        .map(([label, count]) => ({
          name: label,
          value: count,
          percentage: Math.round((count / answers.length) * 100)
        }))
    }

    return []
  }, [question, responses])

  const totalResponses = responses.length
  const answeredResponses = responses.filter(r => {
    const answer = r.answers[question.question_id]
    return answer !== undefined && answer !== null && answer !== ""
  }).length

  const responseRate = Math.round((answeredResponses / totalResponses) * 100)

  // Explicitly exclude name/email questions
  const excludedIds = ['name', 'email', 'full_name', 'email_address']
  if (excludedIds.includes(question.question_id.toLowerCase()) || !["single", "multiple"].includes(question.question_type)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Analytics not available for this question type
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{answeredResponses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Question Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm">
              {question.question_type === "single" ? "Single Choice" : "Multiple Choice"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analyticsData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded"></div>
                Response Distribution (Bar Chart)
              </CardTitle>
              <CardDescription>Number of responses per option</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [value, "Responses"]}
                    labelFormatter={(label) => `Option: ${label}`}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {analyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                Response Distribution (Pie Chart)
              </CardTitle>
              <CardDescription>Percentage breakdown of responses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {analyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, "Responses"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Response count and percentage for each option</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {item.value} responses
                  </span>
                  <Badge variant="secondary">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
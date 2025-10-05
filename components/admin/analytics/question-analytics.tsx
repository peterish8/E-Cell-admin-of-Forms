"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"

interface Form {
  id: string
  title: string
}

export function QuestionAnalytics({ forms }: { forms: Form[] }) {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || "")
  const [questions, setQuestions] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedFormId) return

    const fetchData = async () => {
      setLoading(true)
      const supabase = createClient()

      const [questionsResult, responsesResult] = await Promise.all([
        supabase.from("questions").select("*").eq("form_id", selectedFormId).order("order_index"),
        supabase.from("responses").select("*").eq("form_id", selectedFormId),
      ])

      setQuestions(questionsResult.data || [])
      setResponses(responsesResult.data || [])
      setLoading(false)
    }

    fetchData()
  }, [selectedFormId])

  if (forms.length === 0) {
    return null
  }

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Question Analytics</CardTitle>
            <CardDescription>Analyze responses by question</CardDescription>
          </div>
          <Select value={selectedFormId} onValueChange={setSelectedFormId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No questions in this form
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {questions
              .filter((q) => ["select", "radio", "checkbox"].includes(q.question_type))
              .map((question) => {
                // Count responses for each option
                const optionCounts = question.options.reduce(
                  (acc: Record<string, number>, option: string) => {
                    acc[option] = 0
                    return acc
                  },
                  {} as Record<string, number>,
                )

                responses.forEach((response) => {
                  const answer = response.answers[question.id]
                  if (Array.isArray(answer)) {
                    answer.forEach((a) => {
                      if (optionCounts[a] !== undefined) {
                        optionCounts[a]++
                      }
                    })
                  } else if (answer && optionCounts[answer] !== undefined) {
                    optionCounts[answer]++
                  }
                })

                const chartData = Object.entries(optionCounts).map(([name, value]) => ({
                  name,
                  value,
                }))

                return (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{question.question_text}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {chartData.every((d) => d.value === 0) ? (
                        <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                          No responses yet
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              label
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

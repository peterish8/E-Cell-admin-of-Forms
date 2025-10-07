"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, TrendingUp, Users, BarChart3, PieChart } from "lucide-react"
import { format } from "date-fns"
import { DynamicChart } from "./dynamic-chart"
import { AnalyticsEngine, type ChartDataset } from "@/lib/analytics-engine"
import type { EcellForm, EcellQuestion, Submission } from "@/lib/types"

export function DynamicAnalyticsDashboard() {
  const [forms, setForms] = useState<EcellForm[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>("")
  const [questions, setQuestions] = useState<EcellQuestion[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [chartDatasets, setChartDatasets] = useState<ChartDataset[]>([])
  const [submissionTrend, setSubmissionTrend] = useState<ChartDataset | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Fetch all forms on component mount
  useEffect(() => {
    fetchForms()
  }, [])

  // Fetch form data when form is selected
  useEffect(() => {
    if (selectedFormId) {
      fetchFormData(selectedFormId)
    }
  }, [selectedFormId, dateRange])

  const fetchForms = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("ecell_forms")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setForms(data)
      if (data.length > 0 && !selectedFormId) {
        setSelectedFormId(data[0].id)
      }
    }
  }

  const fetchFormData = async (formId: string) => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Fetch questions for the selected form
      const { data: questionsData, error: questionsError } = await supabase
        .from("ecell_questions")
        .select("*")
        .eq("form_id", formId)
        .order("order_number")

      if (questionsError) throw questionsError

      // Build submissions query with optional date filtering
      let submissionsQuery = supabase
        .from("submissions")
        .select("id, email, answers, created_at")
        .eq("form_id", formId)
        .order("created_at", { ascending: false })

      // Apply date range filter if specified
      if (dateRange.from) {
        submissionsQuery = submissionsQuery.gte("created_at", dateRange.from.toISOString())
      }
      if (dateRange.to) {
        submissionsQuery = submissionsQuery.lte("created_at", dateRange.to.toISOString())
      }

      const { data: submissionsData, error: submissionsError } = await submissionsQuery

      if (submissionsError) throw submissionsError

      // Update state
      setQuestions(questionsData || [])
      setSubmissions(submissionsData || [])

      // Generate dynamic chart datasets using the analytics engine
      if (questionsData && submissionsData) {
        const datasets = AnalyticsEngine.generateChartData(questionsData, submissionsData)
        const trendData = AnalyticsEngine.generateSubmissionTrends(submissionsData)
        
        setChartDatasets(datasets)
        setSubmissionTrend(trendData)
      }

    } catch (error) {
      console.error("Error fetching form data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const selectedForm = forms.find(f => f.id === selectedFormId)
    if (!selectedForm) return

    const exportData = {
      form: selectedForm,
      questions,
      submissions: submissions.length,
      analytics: chartDatasets.map(dataset => ({
        question: dataset.questionText,
        type: dataset.chartType,
        responses: dataset.totalResponses,
        data: dataset.data
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedForm.name.toLowerCase().replace(/\s+/g, '-')}-analytics.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedForm = forms.find(f => f.id === selectedFormId)

  return (
    <div className="space-y-6">
      {/* Header with Form Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Dynamic Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Automatically generated insights for any form - no hardcoding required
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "All time"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range || {})}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={exportData} disabled={!selectedFormId}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a form to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      <div className="flex items-center gap-2">
                        {form.name}
                        <Badge variant={form.is_active ? "default" : "secondary"}>
                          {form.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading analytics...</div>
            </div>
          </CardContent>
        </Card>
      ) : selectedForm ? (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{questions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {questions.filter(q => ['single', 'multiple'].includes(q.question_type)).length} visualized, {questions.filter(q => ['text', 'email', 'fill'].includes(q.question_type)).length} collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{submissions.length}</div>
                <p className="text-xs text-muted-foreground">Unique submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chart Types</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chartDatasets.length}</div>
                <p className="text-xs text-muted-foreground">Auto-generated charts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {questions.length > 0 ? Math.round((submissions.length / questions.length) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Average per question</p>
              </CardContent>
            </Card>
          </div>

          {/* Submission Trends */}
          {submissionTrend && (
            <DynamicChart dataset={submissionTrend} />
          )}

          {/* Dynamic Question Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {chartDatasets.map((dataset) => (
              <DynamicChart key={dataset.questionId} dataset={dataset} />
            ))}
          </div>

          {chartDatasets.length === 0 && submissions.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No responses yet for this form. Charts will appear automatically when users submit responses.
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No forms available. Create a form first to see analytics.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
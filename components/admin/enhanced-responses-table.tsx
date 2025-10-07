"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, BarChart3, PieChart, Copy, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { EcellQuestion, Submission } from "@/lib/types"
import { QuestionAnalytics } from "./question-analytics"

interface EnhancedResponsesTableProps {
  responses: Submission[]
  questions: EcellQuestion[]
  formName: string
  onResponseDeleted?: () => void
}

export function EnhancedResponsesTable({ responses, questions, formName, onResponseDeleted }: EnhancedResponsesTableProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const analyticsQuestions = questions.filter(q => {
    // Explicitly exclude known name/email question IDs
    const excludedIds = ['name', 'email', 'full_name', 'email_address']
    if (excludedIds.includes(q.question_id.toLowerCase())) return false
    
    // Only include single and multiple choice questions
    return ["single", "multiple"].includes(q.question_type)
  })
  const selectedQuestion = analyticsQuestions.find(q => q.id === selectedQuestionId) || null

  const copyTableData = async (format: string) => {
    const excludedIds = ['email', 'email_address']
    const filteredQuestions = questions.filter(q => !excludedIds.includes(q.question_id.toLowerCase()))
    const headers = ["Email", "Submitted At", ...filteredQuestions.map(q => q.question_text)]
    const rows = responses.map(response => [
      response.email || "Anonymous",
      new Date(response.created_at).toISOString().split('T')[0],
      ...filteredQuestions.map(q => {
        const answer = response.answers[q.question_id]
        if (Array.isArray(answer)) return answer.join(", ")
        return answer || ""
      })
    ])

    let content = ""
    switch (format) {
      case "csv":
        content = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n")
        break
      case "tsv":
        content = [headers.join("\t"), ...rows.map(row => row.join("\t"))].join("\n")
        break
      case "markdown":
        content = `| ${headers.join(" | ")} |\n|${headers.map(() => "---").join("|")}|\n${rows.map(row => `| ${row.join(" | ")} |`).join("\n")}`
        break
    }

    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const exportData = (format: string) => {
    const excludedIds = ['email', 'email_address']
    const filteredQuestions = questions.filter(q => !excludedIds.includes(q.question_id.toLowerCase()))
    const headers = ["Email", "Submitted At", ...filteredQuestions.map(q => q.question_text)]
    const rows = responses.map(response => [
      response.email || "Anonymous",
      new Date(response.created_at).toISOString().split('T')[0],
      ...filteredQuestions.map(q => {
        const answer = response.answers[q.question_id]
        if (Array.isArray(answer)) return answer.join(", ")
        return answer || ""
      })
    ])

    let content = ""
    const filename = `${formName.toLowerCase().replace(/\s+/g, '-')}-responses`

    switch (format) {
      case "csv":
        content = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n")
        break
      case "tsv":
        content = [headers.join("\t"), ...rows.map(row => row.join("\t"))].join("\n")
        break
      case "markdown":
        content = `| ${headers.join(" | ")} |\n|${headers.map(() => "---").join("|")}|\n${rows.map(row => `| ${row.join(" | ")} |`).join("\n")}`
        break
      case "json":
        content = JSON.stringify(responses.map(r => ({
          email: r.email,
          created_at: r.created_at,
          answers: r.answers
        })), null, 2)
        break
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getQuestionStats = (question: EcellQuestion) => {
    const answers = responses.map(r => r.answers[question.question_id]).filter(Boolean)
    return {
      totalResponses: answers.length,
      responseRate: Math.round((answers.length / responses.length) * 100)
    }
  }

  const canShowAnalytics = (questionType: string) => {
    return ["single", "multiple"].includes(questionType)
  }

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm('Are you sure you want to delete this response?')) return
    
    // Check admin authentication
    const isAuthenticated = document.cookie.includes('admin_authenticated=true')
    if (!isAuthenticated) {
      alert('Unauthorized: Admin access required')
      return
    }
    
    setDeletingId(responseId)
    try {
      const supabase = createClient()
      
      // Try direct SQL delete as fallback
      const { data: sqlResult, error: sqlError } = await supabase.rpc('delete_submission', {
        submission_id: responseId
      })
      
      if (sqlError) {
        console.log('RPC failed, trying direct delete...')
      } else {
        console.log('RPC delete successful')
        if (onResponseDeleted) {
          onResponseDeleted()
        } else {
          window.location.reload()
        }
        return
      }
      
      console.log('Attempting to delete response with ID:', responseId)
      
      // First check if the record exists
      const { data: existingRecord } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', responseId)
        .single()
      
      console.log('Record before delete:', existingRecord)
      
      const { data, error, count } = await supabase
        .from('submissions')
        .delete()
        .eq('id', responseId)
        .select()
      
      console.log('Delete result:', { data, error, count, deletedRows: data?.length })
      
      // Check if record still exists after delete
      const { data: recordAfterDelete } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', responseId)
        .single()
      
      console.log('Record after delete:', recordAfterDelete)
      
      if (error) {
        console.error('Supabase delete error:', error)
        alert(`Delete failed: ${error.message}`)
        return
      }
      
      console.log('Delete successful, refreshing data...')
      
      // Call the callback to refresh data
      if (onResponseDeleted) {
        onResponseDeleted()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting response:', error)
      alert(`Failed to delete response: ${error}`)
    } finally {
      setDeletingId(null)
    }
  }



  return (
    <div className="space-y-4 mb-32">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Form Responses</h3>
          <p className="text-sm text-muted-foreground">{responses.length} total responses</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => exportData("csv")}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData("tsv")}>
              Export as TSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData("markdown")}>
              Export as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData("json")}>
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Analytics Section */}
      {analyticsQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Question Analytics
                </CardTitle>
                <CardDescription>Select a question to view detailed analytics</CardDescription>
              </div>
              <Select value={selectedQuestionId || ""} onValueChange={setSelectedQuestionId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a question to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {analyticsQuestions.map((question) => (
                    <SelectItem key={question.id} value={question.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {question.question_type}
                        </Badge>
                        <span className="truncate max-w-[200px]">{question.question_text}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          {selectedQuestion && (
            <CardContent>
              <QuestionAnalytics 
                question={selectedQuestion} 
                responses={responses}
              />
            </CardContent>
          )}
        </Card>
      )}

      {/* Responses Table */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Responses</CardTitle>
              <CardDescription>Detailed view of all form submissions</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => copyTableData("csv")}>
                  Copy as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyTableData("tsv")}>
                  Copy as TSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyTableData("markdown")}>
                  Copy as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-max">
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Submitted</TableHead>
                  {questions.filter(q => !['email', 'email_address'].includes(q.question_id.toLowerCase())).map((question) => (
                    <TableHead key={question.id} className="min-w-[200px] whitespace-nowrap">
                      <div title={question.question_text}>
                        {question.question_text}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      {response.email || "Anonymous"}
                    </TableCell>
                    <TableCell>
                      {new Date(response.created_at).toISOString().split('T')[0]}
                    </TableCell>
                    {questions.filter(q => !['email', 'email_address'].includes(q.question_id.toLowerCase())).map((question) => {
                      const answer = response.answers[question.question_id]
                      return (
                        <TableCell key={question.id} className="min-w-[150px] whitespace-nowrap">
                          {Array.isArray(answer) ? (
                            <div className="flex flex-wrap gap-1">
                              {answer.map((item, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm" title={answer || "—"}>
                              {answer || "—"}
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResponse(response.id)}
                        disabled={deletingId === response.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === response.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
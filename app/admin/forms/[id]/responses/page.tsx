"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { EnhancedResponsesTable } from "@/components/admin/enhanced-responses-table"

export default function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    
    const checkAuth = () => {
      const isAuthenticated = document.cookie.includes('admin_authenticated=true')
      if (!isAuthenticated) {
        router.push('/admin/login')
        return false
      }
      return true
    }

    const fetchData = async () => {
      if (!checkAuth()) return
      
      const supabase = createClient()

      // Fetch form with questions
      const { data: formData, error: formError } = await supabase
        .from("ecell_forms")
        .select(`*, ecell_questions (*)`)
        .eq("id", id)
        .single()

      if (formError || !formData) {
        router.push('/admin')
        return
      }

      // Fetch responses
      const { data: responsesData } = await supabase
        .from("submissions")
        .select("*")
        .eq("form_id", id)
        .order("created_at", { ascending: false })

      setForm(formData)
      setResponses(responsesData || [])
      setLoading(false)
    }

    fetchData()
  }, [id, router])

  const handleResponseDeleted = async () => {
    if (!id) return
    
    console.log('Refreshing responses data...')
    const supabase = createClient()
    const { data: responsesData, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("form_id", id)
      .order("created_at", { ascending: false })
    
    console.log('Fetched responses:', responsesData)
    if (error) {
      console.error('Error fetching responses:', error)
    }
    
    setResponses(responsesData || [])
  }

  if (loading || !form) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const sortedQuestions = form.ecell_questions?.sort((a: any, b: any) => a.order_number - b.order_number) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{form.name}</h1>
          <p className="text-muted-foreground">View and analyze form responses</p>
        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {responses.length > 0
                ? Math.round(
                    (responses.filter((r) => Object.keys(r.answers).length === sortedQuestions.length).length /
                      responses.length) *
                      100,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {responses.length > 0
                ? new Date(responses[0].created_at).toISOString().split('T')[0]
                : "No responses"}
            </div>
          </CardContent>
        </Card>
      </div>

      <EnhancedResponsesTable 
        responses={responses} 
        questions={sortedQuestions}
        formName={form.name}
        onResponseDeleted={handleResponseDeleted}
      />
    </div>
  )
}

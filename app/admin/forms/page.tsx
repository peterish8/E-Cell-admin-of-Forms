import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, FileText, Users, BarChart3 } from "lucide-react"
import { FormsTable } from "@/components/admin/forms-table"

export default async function FormsPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")?.value === "true"
  
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const supabase = await createClient()

  // Fetch forms with response counts
  const { data: forms, error } = await supabase
    .from("ecell_forms")
    .select(`
      *,
      submissions:submissions(count)
    `)
    .order("created_at", { ascending: false })

  const formsWithStats = forms?.map((form) => ({
    ...form,
    response_count: form.submissions[0]?.count || 0,
  }))

  // Calculate stats
  const totalForms = forms?.length || 0
  const activeForms = forms?.filter((f) => f.is_active === true).length || 0
  const totalResponses = formsWithStats?.reduce((sum, form) => sum + form.response_count, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">Create and manage your forms</p>
        </div>
        <Button asChild>
          <Link href="/admin/forms/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalForms}</div>
            <p className="text-xs text-muted-foreground">{activeForms} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">Across all forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalForms > 0 ? Math.round((totalResponses / totalForms) * 10) / 10 : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per form</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Forms</CardTitle>
          <CardDescription>View and manage all your forms</CardDescription>
        </CardHeader>
        <CardContent>
          <FormsTable forms={formsWithStats || []} />
        </CardContent>
      </Card>
    </div>
  )
}
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { cookies } from "next/headers"
import { FormBuilder } from "@/components/admin/form-builder"

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")?.value === "true"
  
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const supabase = await createClient()

  // Fetch form with questions
  const { data: form, error } = await supabase
    .from("ecell_forms")
    .select(`
      *,
      ecell_questions (*)
    `)
    .eq("id", id)
    .single()

  if (error || !form) {
    notFound()
  }

  // Sort questions by order_number
  const sortedQuestions = form.ecell_questions?.sort((a, b) => a.order_number - b.order_number) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Form</h1>
        <p className="text-muted-foreground">Update your form details and questions</p>
      </div>
      <FormBuilder userId="admin" initialForm={{ ...form, questions: sortedQuestions }} />
    </div>
  )
}
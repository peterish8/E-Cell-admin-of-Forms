import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { InteractiveFormRenderer } from "@/components/interactive-form-renderer"

interface FormPageProps {
  params: {
    id: string
  }
}

export default async function FormPage({ params }: FormPageProps) {
  const supabase = await createClient()
  
  // Try to fetch form by custom_slug first, then by id
  let { data: form, error: formError } = await supabase
    .from("ecell_forms")
    .select(`
      *,
      ecell_questions:ecell_questions(*)
    `)
    .eq("custom_slug", params.id)
    .eq("is_active", true)
    .single()

  // If not found by slug, try by UUID
  if (formError || !form) {
    const { data: formById, error: formByIdError } = await supabase
      .from("ecell_forms")
      .select(`
        *,
        ecell_questions:ecell_questions(*)
      `)
      .eq("id", params.id)
      .eq("is_active", true)
      .single()
    
    form = formById
    formError = formByIdError
  }

  if (formError || !form) {
    notFound()
  }

  // Sort questions by order
  const sortedQuestions = form.ecell_questions.sort((a, b) => a.order_number - b.order_number)

  return (
    <InteractiveFormRenderer 
      form={{
        ...form,
        questions: sortedQuestions
      }}
    />
  )
}

export async function generateMetadata({ params }: FormPageProps) {
  const supabase = await createClient()
  
  // Try custom_slug first, then id
  let { data: form } = await supabase
    .from("ecell_forms")
    .select("name, description")
    .eq("custom_slug", params.id)
    .single()

  if (!form) {
    const { data: formById } = await supabase
      .from("ecell_forms")
      .select("name, description")
      .eq("id", params.id)
      .single()
    form = formById
  }

  return {
    title: form?.name || "E-Cell Form",
    description: form?.description || "Fill out this E-Cell form",
  }
}
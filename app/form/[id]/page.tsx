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
  
  // Fetch form with questions
  const { data: form, error: formError } = await supabase
    .from("ecell_forms")
    .select(`
      *,
      ecell_questions:ecell_questions(*)
    `)
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

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
  
  const { data: form } = await supabase
    .from("ecell_forms")
    .select("name, description")
    .eq("id", params.id)
    .single()

  return {
    title: form?.name || "E-Cell Form",
    description: form?.description || "Fill out this E-Cell form",
  }
}
import { redirect } from "next/navigation"

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Redirect to responses page instead of edit
  redirect(`/admin/forms/${id}/responses`)
}

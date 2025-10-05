import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { FormBuilder } from "@/components/admin/form-builder"

export default async function NewFormPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")?.value === "true"
  
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Form</h1>
        <p className="text-muted-foreground">Build a new form with custom questions</p>
      </div>
      <FormBuilder userId="admin" />
    </div>
  )
}

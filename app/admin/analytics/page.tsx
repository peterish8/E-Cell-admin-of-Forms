import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DynamicAnalyticsDashboard } from "@/components/admin/analytics/dynamic-analytics-dashboard"

export default async function AnalyticsPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")?.value === "true"
  
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Dynamic insights that work for any form - no hardcoding required</p>
      </div>

      <DynamicAnalyticsDashboard />
    </div>
  )
}

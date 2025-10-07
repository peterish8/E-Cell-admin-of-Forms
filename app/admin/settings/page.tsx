import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, User, Database, Shield } from "lucide-react"
import { QuickActions } from "@/components/admin/quick-actions"

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin_authenticated")?.value === "true"
  
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  const handleLogout = async () => {
    "use server"
    const cookieStore = await cookies()
    cookieStore.delete("admin_authenticated")
    redirect("/admin/login")
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your admin account and system preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your admin account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <p className="text-sm text-muted-foreground">prats8</p>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <p className="text-sm text-muted-foreground">Administrator</p>
            </div>
            <div>
              <label className="text-sm font-medium">Last Login</label>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Database</label>
              <p className="text-sm text-green-600">Connected</p>
            </div>
            <div>
              <label className="text-sm font-medium">Version</label>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <label className="text-sm font-medium">Environment</label>
              <p className="text-sm text-muted-foreground">Production</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Authentication Method</label>
              <p className="text-sm text-muted-foreground">Cookie-based</p>
            </div>
            <div>
              <label className="text-sm font-medium">Session Status</label>
              <p className="text-sm text-green-600">Active</p>
            </div>
            <form action={handleLogout}>
              <Button variant="destructive" type="submit" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
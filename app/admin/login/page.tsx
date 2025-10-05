import { LoginForm } from "@/components/admin/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in to access the E-Cell admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}

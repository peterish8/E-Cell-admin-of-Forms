"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface FormWithStats {
  id: string
  title: string
  response_count: number
}

export function FormComparisonChart({ forms }: { forms: FormWithStats[] }) {
  const chartData = forms
    .map((form) => ({
      name: form.title.length > 20 ? form.title.substring(0, 20) + "..." : form.title,
      responses: form.response_count,
    }))
    .slice(0, 10) // Top 10 forms

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Comparison</CardTitle>
          <CardDescription>Response counts by form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Comparison</CardTitle>
        <CardDescription>Response counts by form (top 10)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="responses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

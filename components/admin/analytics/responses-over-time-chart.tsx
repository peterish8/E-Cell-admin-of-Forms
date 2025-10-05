"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import type { Response } from "@/lib/types"

export function ResponsesOverTimeChart({ responses }: { responses: Response[] }) {
  // Group responses by date
  const responsesByDate = responses.reduce(
    (acc, response) => {
      const date = new Date(response.submitted_at).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(responsesByDate)
    .map(([date, count]) => ({
      date,
      responses: count,
    }))
    .slice(-30) // Last 30 days

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Responses Over Time</CardTitle>
          <CardDescription>Daily response trends</CardDescription>
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
        <CardTitle>Responses Over Time</CardTitle>
        <CardDescription>Daily response trends (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Line type="monotone" dataKey="responses" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

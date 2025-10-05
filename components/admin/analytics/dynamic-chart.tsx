"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from "recharts"
import type { ChartDataset } from "@/lib/analytics-engine"

interface DynamicChartProps {
  dataset: ChartDataset
}

const COLORS = ['#FF8C32', '#FFA533', '#FFD233', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

export function DynamicChart({ dataset }: DynamicChartProps) {
  const { questionText, chartType, data, totalResponses } = dataset

  // Transform data for Recharts format
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
    color: data.datasets[0].backgroundColor[index] || data.datasets[0].backgroundColor
  }))

  const renderChart = () => {
    // Force all charts to be pie charts except for line charts (trends)
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs" 
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip 
              formatter={(value: number) => [value, 'Submissions']}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#FF8C32" 
              strokeWidth={2}
              dot={{ fill: '#FF8C32' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }
    
    // All other charts become pie charts
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Responses']}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const getChartTypeLabel = () => {
    if (chartType === 'line') return 'Trend Analysis'
    return 'Distribution'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{questionText}</CardTitle>
        <CardDescription>
          {getChartTypeLabel()} • {totalResponses} responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalResponses === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No responses yet
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  )
}
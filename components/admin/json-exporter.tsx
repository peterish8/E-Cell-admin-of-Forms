"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { EcellQuestion } from "@/lib/types"

interface JsonExporterProps {
  questions: EcellQuestion[]
  formName: string
}

export function JsonExporter({ questions, formName }: JsonExporterProps) {
  const exportToJson = () => {
    const exportData = {
      form_name: formName,
      questions: questions.map(q => ({
        question_text: q.question_text,
        question_id: q.question_id,
        question_type: q.question_type,
        options: q.options,
        is_required: q.is_required,
        placeholder: q.placeholder
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formName.toLowerCase().replace(/\s+/g, '-')}-questions.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (questions.length === 0) return null

  return (
    <Button variant="outline" size="sm" onClick={exportToJson}>
      <Download className="mr-2 h-4 w-4" />
      Export JSON
    </Button>
  )
}
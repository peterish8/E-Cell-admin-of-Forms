"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileJson, Type } from "lucide-react"
import type { EcellQuestion } from "@/lib/types"

interface JsonUploaderProps {
  onQuestionsLoaded: (data: EcellQuestion[] | { questions: EcellQuestion[], formTitle?: string, formDescription?: string }) => void
}

export function JsonUploader({ onQuestionsLoaded }: JsonUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [jsonText, setJsonText] = useState("")

  const processJson = (text: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = JSON.parse(text)

      // Validate JSON structure
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("JSON must have a 'questions' array")
      }

      // Convert to EcellQuestion format
      const questions: EcellQuestion[] = data.questions.map((q: any, index: number) => ({
        id: crypto.randomUUID(),
        form_id: "",
        question_text: q.question_text || q.question || "",
        question_id: q.question_id || `q_${index + 1}`,
        question_type: q.question_type || "text",
        options: q.options || null,
        is_required: q.is_required ?? true,
        order_number: index + 1,
        placeholder: q.placeholder || null,
        created_at: new Date().toISOString(),
      }))

      // Pass form metadata if available
      const formData = {
        questions,
        formTitle: data.form_title || data.title,
        formDescription: data.form_description || data.description
      }

      onQuestionsLoaded(formData)
      setJsonText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json") {
      setError("Please upload a JSON file")
      return
    }

    try {
      const text = await file.text()
      processJson(text)
      event.target.value = ""
    } catch (err) {
      setError("Failed to read file")
      setIsLoading(false)
    }
  }

  const handleTextImport = () => {
    if (!jsonText.trim()) {
      setError("Please enter JSON text")
      return
    }
    processJson(jsonText)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Import Questions from JSON
        </CardTitle>
        <CardDescription>
          Import questions by pasting JSON text or uploading a file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Paste JSON
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="paste" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="json-text">JSON Text</Label>
              <Textarea
                id="json-text"
                placeholder="Paste your JSON here..."
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleTextImport} disabled={isLoading || !jsonText.trim()}>
              Import Questions
            </Button>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="json-upload">JSON File</Label>
              <Input
                id="json-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Expected JSON format:</p>
          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "form_title": "E-Cell Startup Form",
  "form_description": "Tell us about your startup journey",
  "questions": [
    {
      "question_text": "Full Name",
      "question_id": "name",
      "question_type": "fill",
      "is_required": true,
      "placeholder": "Enter your full name"
    },
    {
      "question_text": "What's your startup vibe?",
      "question_id": "startup_vibe",
      "question_type": "single",
      "options": [
        {"label": "Dreamer", "value": "dreamer"},
        {"label": "Builder", "value": "builder"}
      ],
      "is_required": true
    }
  ]
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
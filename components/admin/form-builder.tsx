"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { QuestionEditor } from "./question-editor"
import { FormPreview } from "./form-preview"
import { JsonExporter } from "./json-exporter"
import type { EcellForm, EcellQuestion } from "@/lib/types"
import { Save, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface FormBuilderProps {
  userId: string
  initialForm?: EcellForm & { questions: EcellQuestion[] }
}

export function FormBuilder({ userId, initialForm }: FormBuilderProps) {
  const router = useRouter()
  const [name, setName] = useState(initialForm?.name || "")
  const [description, setDescription] = useState(initialForm?.description || "")
  const [customSlug, setCustomSlug] = useState(initialForm?.custom_slug || "")
  const [isActive, setIsActive] = useState(initialForm?.is_active ?? true)
  const [questions, setQuestions] = useState<EcellQuestion[]>(initialForm?.questions || [])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Form name is required")
      return
    }

    // Validate custom slug if provided
    if (customSlug && !/^[a-zA-Z0-9_-]+$/.test(customSlug)) {
      setError("Custom slug can only contain letters, numbers, hyphens, and underscores")
      return
    }

    setIsSaving(true)
    setError(null)
    const supabase = createClient()

    // Check if custom slug is already taken (if provided and not updating same form)
    if (customSlug) {
      try {
        const { data: existingForm } = await supabase
          .from("ecell_forms")
          .select("id")
          .eq("custom_slug", customSlug)
          .single()
        
        if (existingForm && (!initialForm || existingForm.id !== initialForm.id)) {
          setError("This custom slug is already taken. Please choose a different one.")
          setIsSaving(false)
          return
        }
      } catch (slugError) {
        // If custom_slug column doesn't exist, skip validation
        console.warn("Custom slug validation skipped - column may not exist yet")
      }
    }

    try {
      if (initialForm) {
        // Update existing form
        const updateData: any = {
          name: name.trim(),
          description: description.trim(),
          is_active: isActive,
        }
        
        if (customSlug) updateData.custom_slug = customSlug.trim()
        
        console.log('Updating form with data:', updateData)
        const { error: formError } = await supabase
          .from("ecell_forms")
          .update(updateData)
          .eq("id", initialForm.id)

        if (formError) {
          console.error('Form update error:', formError)
          throw formError
        }

        // Delete existing questions
        const { error: deleteError } = await supabase.from("ecell_questions").delete().eq("form_id", initialForm.id)

        if (deleteError) throw deleteError

        // Insert updated questions
        if (questions.length > 0) {
          const questionsToInsert = questions.map((q, index) => ({
            form_id: initialForm.id,
            question_text: q.question_text,
            question_id: q.question_id || `q_${index + 1}`,
            question_type: q.question_type,
            options: q.options,
            is_required: q.is_required,
            order_number: index + 1,
            placeholder: q.placeholder,
          }))

          const { error: questionsError } = await supabase.from("ecell_questions").insert(questionsToInsert)

          if (questionsError) throw questionsError
        }

        router.push("/admin")
        router.refresh()
      } else {
        // Create new form
        const insertData: any = {
          name: name.trim(),
          description: description.trim(),
          is_active: isActive,
        }
        
        if (customSlug) insertData.custom_slug = customSlug.trim()
        
        console.log('Creating form with data:', insertData)
        const { data: formData, error: formError } = await supabase
          .from("ecell_forms")
          .insert(insertData)
          .select()
          .single()

        if (formError) {
          console.error('Form creation error:', formError)
          throw formError
        }

        // Insert questions
        if (questions.length > 0) {
          const questionsToInsert = questions.map((q, index) => ({
            form_id: formData.id,
            question_text: q.question_text,
            question_id: q.question_id || `q_${index + 1}`,
            question_type: q.question_type,
            options: q.options,
            is_required: q.is_required,
            order_number: index + 1,
            placeholder: q.placeholder,
          }))

          const { error: questionsError } = await supabase.from("ecell_questions").insert(questionsToInsert)

          if (questionsError) throw questionsError
        }

        router.push("/admin")
        router.refresh()
      }
    } catch (err) {
      console.error('Save form error:', err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred while saving the form"
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1" />
        <JsonExporter questions={questions} formName={name} />
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          disabled={questions.length === 0}
        >
          {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {showPreview ? "Hide Preview" : "Preview Form"}
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Form"}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
          <CardDescription>Configure your form's basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Form Name</Label>
            <Input 
              id="name" 
              placeholder="E-Cell Evaluation 2024" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this form is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customSlug">Custom URL Slug (Optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">https://ecell-forms.vercel.app/form/</span>
              <Input 
                id="customSlug" 
                placeholder="my-custom-form" 
                value={customSlug} 
                onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to use auto-generated ID. Only letters, numbers, hyphens, and underscores allowed.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active">Form is active and accepting responses</Label>
          </div>
        </CardContent>
      </Card>

      {showPreview ? (
        <FormPreview 
          formName={name} 
          formDescription={description} 
          questions={questions} 
        />
      ) : (
        <QuestionEditor 
          questions={questions} 
          setQuestions={setQuestions} 
          onFormMetadata={(title, desc) => {
            if (title) setName(title)
            if (desc) setDescription(desc)
          }}
        />
      )}
    </div>
  )
}

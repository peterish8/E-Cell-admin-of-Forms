"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GripVertical, X } from "lucide-react"
import type { EcellQuestion } from "@/lib/types"
import { TemplateSelector } from "./template-selector"
import { JsonUploader } from "./json-uploader"

interface QuestionEditorProps {
  questions: EcellQuestion[]
  setQuestions: (questions: EcellQuestion[]) => void
  onFormMetadata?: (title: string, description: string) => void
}

const questionTypes = [
  { value: "fill", label: "📝 Fill Input (Name, Phone, etc.)" },
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "📄 Long Text (Paragraph)" },
  { value: "email", label: "Email" },
  { value: "single", label: "🎯 Single Choice (Radio)" },
  { value: "multiple", label: "✅ Multiple Choice (Checkbox)" },
]

export function QuestionEditor({ questions, setQuestions, onFormMetadata }: QuestionEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addQuestion = () => {
    const newQuestion: EcellQuestion = {
      id: crypto.randomUUID(),
      form_id: "",
      question_text: "",
      question_id: `q_${questions.length + 1}`,
      question_type: "text",
      options: null,
      is_required: true,
      order_number: questions.length + 1,
      placeholder: null,
      created_at: new Date().toISOString(),
    }
    setQuestions([...questions, newQuestion])
    setEditingIndex(questions.length)
  }

  const updateQuestion = (index: number, updates: Partial<EcellQuestion>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
  }

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    setQuestions(updated)
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === questions.length - 1)) {
      return
    }

    const updated = [...questions]
    const newIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setQuestions(updated)
  }

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex]
    const currentOptions = question.options || []
    const newOptions = [...currentOptions, { label: "", value: "" }]
    updateQuestion(questionIndex, { options: newOptions })
  }

  const updateOption = (questionIndex: number, optionIndex: number, field: 'label' | 'value', value: string) => {
    const question = questions[questionIndex]
    const currentOptions = question.options || []
    const newOptions = [...currentOptions]
    
    if (field === 'label') {
      // Auto-generate value from label
      const autoValue = value.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
      newOptions[optionIndex] = { label: value, value: autoValue }
    } else {
      newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value }
    }
    
    updateQuestion(questionIndex, { options: newOptions })
  }

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex]
    const currentOptions = question.options || []
    const newOptions = currentOptions.filter((_, i) => i !== optionIndex)
    updateQuestion(questionIndex, { options: newOptions.length > 0 ? newOptions : null })
  }

  const needsOptions = (type: string) => ["single", "multiple"].includes(type)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions</CardTitle>
        <CardDescription>Add and configure questions for your form</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <p className="text-muted-foreground">No questions yet. Choose how to get started:</p>
              <div className="flex gap-2">
                <TemplateSelector onSelectTemplate={setQuestions} />
              </div>
            </div>
            <JsonUploader onQuestionsLoaded={(data) => {
              if (Array.isArray(data)) {
                setQuestions(data)
              } else {
                setQuestions(data.questions)
                if (onFormMetadata && (data.formTitle || data.formDescription)) {
                  onFormMetadata(data.formTitle || '', data.formDescription || '')
                }
              }
            }} />
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveQuestion(index, "up")}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid gap-2">
                        <Label>Question {index + 1}</Label>
                        <Input
                          placeholder="What's your startup vibe?"
                          value={question.question_text}
                          onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Question ID</Label>
                        <Input
                          placeholder="q_1"
                          value={question.question_id}
                          onChange={(e) => updateQuestion(index, { question_id: e.target.value })}
                        />
                      </div>

                      {(question.question_type === "text" || question.question_type === "email" || question.question_type === "fill") && (
                        <div className="grid gap-2">
                          <Label>Placeholder Text</Label>
                          <Input
                            placeholder="Enter placeholder text..."
                            value={question.placeholder || ""}
                            onChange={(e) => updateQuestion(index, { placeholder: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>Question Type</Label>
                          <Select
                            value={question.question_type}
                            onValueChange={(value) =>
                              updateQuestion(index, {
                                question_type: value as EcellQuestion["question_type"],
                                options: needsOptions(value) ? (question.options || [{ label: "Option 1", value: "opt1" }]) : null,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {questionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${index}`}
                              checked={question.is_required}
                              onCheckedChange={(checked) => updateQuestion(index, { is_required: checked as boolean })}
                            />
                            <Label htmlFor={`required-${index}`} className="text-sm font-normal">
                              Required
                            </Label>
                          </div>
                        </div>
                      </div>

                      {needsOptions(question.question_type) && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          <div className="space-y-2">
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <Input
                                  placeholder={`Option ${optionIndex + 1}`}
                                  value={option.label}
                                  onChange={(e) => updateOption(index, optionIndex, 'label', e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteOption(index, optionIndex)}
                                  disabled={(question.options?.length || 0) <= 1}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addOption(index)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteQuestion(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={addQuestion} variant="outline" className="flex-1">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
          <div className="flex-shrink-0">
            <TemplateSelector onSelectTemplate={(newQuestions) => setQuestions([...questions, ...newQuestions])} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

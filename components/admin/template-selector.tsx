"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FORM_TEMPLATES, type FormTemplate } from "@/lib/form-templates"
import { FileText, Users, MessageSquare, Sparkles } from "lucide-react"
import type { EcellQuestion } from "@/lib/types"

interface TemplateSelectorProps {
  onSelectTemplate: (questions: EcellQuestion[]) => void
}

const categoryIcons = {
  evaluation: FileText,
  survey: Users,
  feedback: MessageSquare,
}

const categoryColors = {
  evaluation: "bg-orange-100 text-orange-800",
  survey: "bg-blue-100 text-blue-800", 
  feedback: "bg-green-100 text-green-800",
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleUseTemplate = (template: FormTemplate) => {
    const questions: EcellQuestion[] = template.questions.map((q, index) => ({
      ...q,
      id: crypto.randomUUID(),
      form_id: "",
      created_at: new Date().toISOString(),
    }))
    
    onSelectTemplate(questions)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="whitespace-nowrap">
          <Sparkles className="mr-2 h-4 w-4" />
          Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Form Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template designed for E-Cell activities
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FORM_TEMPLATES.map((template) => {
            const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons] || FileText
            const colorClass = categoryColors[template.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"
            
            return (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="secondary" className={colorClass}>
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {template.questions.length} questions
                    </span>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUseTemplate(template)
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {selectedTemplate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview: {selectedTemplate.name}</CardTitle>
              <CardDescription>{selectedTemplate.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedTemplate.questions.map((question, index) => (
                  <div key={index} className="border-l-2 border-orange-200 pl-4">
                    <div className="font-medium text-sm">
                      {index + 1}. {question.question_text}
                      {question.is_required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Type: {question.question_type}
                      {question.options && ` • ${question.options.length} options`}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleUseTemplate(selectedTemplate)}>
                  Use This Template
                </Button>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Back to Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
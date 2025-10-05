"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { EcellQuestion } from "@/lib/types"

interface FormPreviewProps {
  formName: string
  formDescription: string | null
  questions: EcellQuestion[]
}

export function FormPreview({ formName, formDescription, questions }: FormPreviewProps) {
  const renderQuestion = (question: EcellQuestion) => {
    switch (question.question_type) {
      case "text":
        return (
          <Input
            placeholder={question.placeholder || "Enter your answer..."}
            disabled
          />
        )
      
      case "email":
        return (
          <Input
            type="email"
            placeholder={question.placeholder || "Enter your email..."}
            disabled
          />
        )
      
      case "single":
        return (
          <RadioGroup disabled>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${question.id}_${index}`} />
                <Label htmlFor={`${question.id}_${index}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case "multiple":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${question.id}_${index}`} disabled />
                <Label htmlFor={`${question.id}_${index}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        )
      
      default:
        return <Input placeholder="Preview not available" disabled />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Preview</CardTitle>
        <CardDescription>This is how your form will appear to users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-2xl mx-auto space-y-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{formName || "Untitled Form"}</h1>
            {formDescription && (
              <p className="text-gray-600">{formDescription}</p>
            )}
          </div>
          
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No questions added yet. Add questions to see the preview.
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-base font-medium">
                    {index + 1}. {question.question_text}
                    {question.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderQuestion(question)}
                </div>
              ))}
              
              <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600" disabled>
                Submit Response
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
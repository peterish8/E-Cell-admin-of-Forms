"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import type { EcellForm, EcellQuestion } from "@/lib/types"

interface PublicFormRendererProps {
  form: EcellForm & { questions: EcellQuestion[] }
}

export function PublicFormRenderer({ form }: PublicFormRendererProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleMultipleChoiceChange = (questionId: string, optionValue: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || []
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionValue]
        }
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((v: string) => v !== optionValue)
        }
      }
    })
  }

  const validateForm = () => {
    const requiredQuestions = form.questions.filter(q => q.is_required)
    const missingAnswers = requiredQuestions.filter(q => {
      const answer = answers[q.question_id]
      return !answer || (Array.isArray(answer) && answer.length === 0)
    })

    if (missingAnswers.length > 0) {
      setError(`Please answer all required questions: ${missingAnswers.map(q => q.question_text).join(', ')}`)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    const supabase = createClient()
    const userEmail = answers.email || null

    try {
      // Check for existing submission
      if (userEmail) {
        const { data: existing } = await supabase
          .from("submissions")
          .select("id")
          .eq("form_id", form.id)
          .eq("email", userEmail)
          .single()

        if (existing) {
          setError("You have already submitted this form. Only one submission per user is allowed.")
          setIsSubmitting(false)
          return
        }
      }

      // Submit to submissions table
      const { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .insert({
          form_id: form.id,
          email: userEmail,
          answers,
        })
        .select()
        .single()

      if (submissionError) {
        if (submissionError.code === '23505') {
          throw new Error("You have already submitted this form. Only one submission per user is allowed.")
        }
        throw submissionError
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting the form")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: EcellQuestion) => {
    switch (question.question_type) {
      case "text":
        return (
          <Input
            placeholder={question.placeholder || "Enter your answer..."}
            value={answers[question.question_id] || ""}
            onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
            required={question.is_required}
          />
        )
      
      case "email":
        return (
          <Input
            type="email"
            placeholder={question.placeholder || "Enter your email..."}
            value={answers[question.question_id] || ""}
            onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
            required={question.is_required}
          />
        )
      
      case "fill":
        return (
          <Input
            placeholder={question.placeholder || "Enter your answer..."}
            value={answers[question.question_id] || ""}
            onChange={(e) => handleAnswerChange(question.question_id, e.target.value)}
            required={question.is_required}
          />
        )
      
      case "single":
        return (
          <RadioGroup
            value={answers[question.question_id] || ""}
            onValueChange={(value) => handleAnswerChange(question.question_id, value)}
            required={question.is_required}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${question.id}_${index}`} />
                <Label htmlFor={`${question.id}_${index}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case "multiple":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}_${index}`}
                  checked={(answers[question.question_id] || []).includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleMultipleChoiceChange(question.question_id, option.value, checked as boolean)
                  }
                />
                <Label htmlFor={`${question.id}_${index}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )
      
      default:
        return <div className="text-muted-foreground">Question type not supported</div>
    }
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-700">Thank You!</h2>
            <p className="text-muted-foreground">
              Your response has been submitted successfully. We appreciate your participation in E-Cell activities!
            </p>
            <Button 
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
          {form.name}
        </CardTitle>
        {form.description && (
          <CardDescription className="text-base">
            {form.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {form.questions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <Label className="text-base font-medium">
                {index + 1}. {question.question_text}
                {question.is_required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderQuestion(question)}
            </div>
          ))}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          >
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
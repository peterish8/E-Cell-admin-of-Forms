"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import type { EcellForm, EcellQuestion } from "@/lib/types"

interface InteractiveFormRendererProps {
  form: EcellForm & { questions: EcellQuestion[] }
}

export function InteractiveFormRenderer({ form }: InteractiveFormRendererProps) {
  const router = useRouter()
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const progress = ((currentStep + 1) / form.questions.length) * 100
  const currentQuestion = form.questions[currentStep]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting && hasStarted && !isComplete) {
        handleNext()
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        handleBack()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, isSubmitting, hasStarted, isComplete])

  const handleAnswer = (questionId: string, value: any, questionType: string) => {
    if (questionType === 'multiple') {
      const current = answers[questionId] || []
      const updated = Array.isArray(current) 
        ? current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
        : [value]
      setAnswers(prev => ({ ...prev, [questionId]: updated }))
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }))
    }
    setError(null)
  }

  const validateAnswer = () => {
    if (!currentQuestion.is_required) return true
    
    const answer = answers[currentQuestion.question_id]
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      setError("This question is required")
      return false
    }

    if (currentQuestion.question_type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(answer)) {
        setError("Please enter a valid email address")
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (!validateAnswer()) return

    if (currentStep < form.questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const supabase = createClient()
    const userEmail = answers.email || null

    try {
      if (userEmail) {
        const { data: existing } = await supabase
          .from("submissions")
          .select("id")
          .eq("form_id", form.id)
          .eq("email", userEmail)
          .single()

        if (existing) {
          throw new Error("You have already submitted this form")
        }
      }

      const { error: submissionError } = await supabase
        .from("submissions")
        .insert({
          form_id: form.id,
          email: userEmail,
          answers,
        })

      if (submissionError) throw submissionError

      setIsComplete(true)
      
      // Confetti effect
      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Initial landing screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0">
          <CardContent className="p-12 text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                {form.name}
              </h1>
              {form.description && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {form.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{form.questions.length} questions</span>
              <span>•</span>
              <span>~{Math.ceil(form.questions.length * 0.5)} minutes</span>
            </div>

            <Button
              onClick={() => setHasStarted(true)}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{
                boxShadow: 'rgba(255, 140, 50, 0.3) 0 4px 12px, rgba(255, 140, 50, 0.15) 0 8px 24px'
              }}
            >
              Start Form
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0">
          <CardContent className="p-12 text-center space-y-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-green-600">Congratulations!</h1>
            <p className="text-xl text-muted-foreground">
              Your response has been recorded successfully. We appreciate your participation!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main form interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">
              Question {currentStep + 1} of {form.questions.length} • {Math.round(progress)}% complete
            </div>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-white/50"
            style={{
              background: 'rgba(255, 255, 255, 0.5)'
            }}
          />
        </div>

        {/* Question card */}
        <Card className="shadow-2xl border-0 mb-8">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                {currentQuestion.question_text}
                {currentQuestion.is_required && <span className="text-red-500 ml-1">*</span>}
              </h2>
            </div>

            {/* Question content */}
            <div className="space-y-4">
              {currentQuestion.question_type === 'single' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => {
                    const isSelected = answers[currentQuestion.question_id] === option.value
                    return (
                      <div
                        key={index}
                        onClick={() => handleAnswer(currentQuestion.question_id, option.value, 'single')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-102 active:scale-98 ${
                          isSelected 
                            ? 'border-orange-500 bg-orange-50 shadow-md' 
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <span className="text-lg">{option.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {currentQuestion.question_type === 'multiple' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => {
                    const selectedAnswers = answers[currentQuestion.question_id] || []
                    const isSelected = selectedAnswers.includes(option.value)
                    return (
                      <div
                        key={index}
                        onClick={() => handleAnswer(currentQuestion.question_id, option.value, 'multiple')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-102 active:scale-98 ${
                          isSelected 
                            ? 'border-orange-500 bg-orange-50 shadow-md' 
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-lg">{option.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {(['text', 'email', 'fill'].includes(currentQuestion.question_type)) && (
                <Input
                  type={currentQuestion.question_type === 'email' ? 'email' : 'text'}
                  placeholder={currentQuestion.placeholder || "Enter your answer..."}
                  value={answers[currentQuestion.question_id] || ""}
                  onChange={(e) => handleAnswer(currentQuestion.question_id, e.target.value, currentQuestion.question_type)}
                  className="text-lg p-4 border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                  autoFocus
                />
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
            style={{
              boxShadow: 'rgba(255, 140, 50, 0.2) 0 2px 4px, rgba(255, 140, 50, 0.15) 0 7px 13px -3px'
            }}
          >
            {isSubmitting ? "Submitting..." : currentStep === form.questions.length - 1 ? "Submit" : "Next"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
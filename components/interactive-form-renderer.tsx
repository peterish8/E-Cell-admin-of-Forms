"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react"
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

  const progress = (currentStep / form.questions.length) * 100
  const currentQuestion = form.questions[currentStep]

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting && !isComplete) {
        e.preventDefault()
        handleNext()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, isSubmitting, isComplete, answers])

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
    if (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
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
    const userName = answers.name || null

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
          name: userName,
          answers: answers,
        })

      if (submissionError) throw submissionError

      setIsComplete(true)
      
      // Confetti effect with orange colors from center
      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#FF8C32', '#FFA533', '#FFD233']
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center space-y-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              {form.name}
            </h1>
            {form.description && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {form.description}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
              <span>{form.questions.length} questions</span>
              <span>•</span>
              <span>~{Math.ceil(form.questions.length * 0.5)} minutes</span>
            </div>
            <Button
              onClick={() => setHasStarted(true)}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl"
            >
              Start Form
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center space-y-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Thank You! 🎉</h1>
            <p className="text-xl text-gray-600">
              Your response has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">
              Question {currentStep + 1} of {form.questions.length}
            </span>
            <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-6">
            {currentQuestion.question_text}
            {currentQuestion.is_required && <span className="text-orange-500 ml-1">*</span>}
          </h2>

          <div className="space-y-4 mb-6">
            {currentQuestion.question_type === 'single' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = answers[currentQuestion.question_id] === option.value
                  return (
                    <div
                      key={index}
                      onClick={() => handleAnswer(currentQuestion.question_id, option.value, 'single')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50 shadow-md' 
                          : 'border-gray-200 hover:border-orange-300'
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
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50 shadow-md' 
                          : 'border-gray-200 hover:border-orange-300'
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
                type={currentQuestion.question_type === 'email' ? 'email' : currentQuestion.question_type === 'fill' && currentQuestion.question_id.toLowerCase().includes('phone') ? 'tel' : 'text'}
                name={
                  currentQuestion.question_id.toLowerCase().includes('name') ? 'name' :
                  currentQuestion.question_id.toLowerCase().includes('email') ? 'email' :
                  currentQuestion.question_type === 'email' ? 'email' :
                  currentQuestion.question_id.toLowerCase().includes('phone') ? 'tel' :
                  currentQuestion.question_id
                }
                placeholder={currentQuestion.placeholder || "Type your answer here..."}
                value={answers[currentQuestion.question_id] || ""}
                autoComplete={
                  currentQuestion.question_id.toLowerCase().includes('name') ? 'name' :
                  currentQuestion.question_id.toLowerCase().includes('email') ? 'email' :
                  currentQuestion.question_type === 'email' ? 'email' :
                  currentQuestion.question_id.toLowerCase().includes('phone') ? 'tel' :
                  'off'
                }
                onChange={(e) => handleAnswer(currentQuestion.question_id, e.target.value, currentQuestion.question_type)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleNext()
                  }
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                autoFocus
              />
            )}

            {currentQuestion.question_type === 'textarea' && (
              <textarea
                placeholder={currentQuestion.placeholder || "Type your answer here..."}
                value={answers[currentQuestion.question_id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.question_id, e.target.value, currentQuestion.question_type)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault()
                    handleNext()
                  }
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg min-h-[120px] resize-none"
                autoFocus
              />
            )}
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-4 flex items-center gap-2 bg-red-50 p-3 rounded-lg">
              <div className="w-1 h-4 bg-red-500 rounded"></div>
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {currentStep === form.questions.length - 1 ? (
                isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Response
                    <Check className="h-4 w-4" />
                  </>
                )
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
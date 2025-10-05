// E-Cell Form Types
export interface EcellForm {
  id: string
  name: string
  description: string | null
  is_active: boolean
  custom_slug: string | null
  created_at: string
  created_by: string
}

export interface EcellQuestion {
  id: string
  form_id: string
  question_text: string
  question_id: string
  question_type: "single" | "multiple" | "text" | "email" | "fill"
  options: { label: string; value: string }[] | null
  is_required: boolean
  order_number: number
  placeholder: string | null
  created_at: string
}

export interface Submission {
  id: string
  form_id: string
  answers: Record<string, any>
  created_at: string
  email: string | null
}

// Removed EcellResponseFlat - using dynamic JSON approach

export interface FormWithQuestions extends EcellForm {
  questions: EcellQuestion[]
}

export interface FormWithStats extends EcellForm {
  response_count: number
  completion_rate: number
}

// Analytics Types
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface FormAnalytics {
  totalSubmissions: number
  completionRate: number
  averageTime: number
  topResponses: ChartData[]
}

export interface QuestionAnalytics {
  questionId: string
  questionText: string
  questionType: string
  responseCount: number
  data: ChartData[]
}

// Backward compatibility
export type Form = EcellForm
export type Question = EcellQuestion
export type Response = Submission

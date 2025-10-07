import type { EcellForm, EcellQuestion, Submission } from "./types"

export interface ChartDataset {
  questionId: string
  questionText: string
  questionType: string
  chartType: 'pie' | 'bar' | 'line' | 'wordcloud'
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string[]
      borderColor?: string[]
    }[]
  }
  totalResponses: number
}

export class AnalyticsEngine {
  private static readonly COLORS = [
    '#FF8C32', '#FFA533', '#FFD233', '#FF6B6B', '#4ECDC4',
    '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
  ]

  /**
   * Transform raw form data into chart datasets
   * Works dynamically for any form structure
   */
  static generateChartData(
    questions: EcellQuestion[],
    submissions: Submission[]
  ): ChartDataset[] {
    console.log('All questions:', questions.map(q => ({ id: q.question_id, type: q.question_type, text: q.question_text })))
    
    return questions
      .filter(question => {
        // Explicitly exclude known name/email question IDs
        const excludedIds = ['name', 'email']
        return !excludedIds.includes(question.question_id.toLowerCase())
      })
      .map(question => {
        // Extract all answers for this specific question from submissions
        const questionAnswers = submissions
          .map(sub => sub.answers[question.question_id])
          .filter(answer => answer !== undefined && answer !== null && answer !== '')

        // Use pie charts for all question types
        return this.createPieChart(question, questionAnswers)
      })
      .filter(dataset => dataset.totalResponses > 0)
  }

  /**
   * Create pie chart for single-choice and multiple-choice questions
   */
  private static createPieChart(question: EcellQuestion, answers: any[]): ChartDataset {
    const optionCounts: Record<string, number> = {}
    
    // Initialize counts for all options
    question.options?.forEach(option => {
      optionCounts[option.label] = 0
    })

    // Count actual responses
    answers.forEach(answer => {
      if (Array.isArray(answer)) {
        // Handle multiple choice answers (arrays)
        answer.forEach(value => {
          const option = question.options?.find(opt => opt.value === value)
          if (option) {
            const decodedLabel = option.label.replace(/&#39;/g, "'").replace(/&amp;/g, "&")
            optionCounts[decodedLabel] = (optionCounts[decodedLabel] || 0) + 1
          } else if (typeof value === 'string') {
            const decodedValue = value.replace(/&#39;/g, "'").replace(/&amp;/g, "&")
            optionCounts[decodedValue] = (optionCounts[decodedValue] || 0) + 1
          }
        })
      } else {
        // Handle single choice answers
        const option = question.options?.find(opt => opt.value === answer)
        if (option) {
          const decodedLabel = option.label.replace(/&#39;/g, "'").replace(/&amp;/g, "&")
          optionCounts[decodedLabel] = (optionCounts[decodedLabel] || 0) + 1
        } else if (typeof answer === 'string') {
          const decodedAnswer = answer.replace(/&#39;/g, "'").replace(/&amp;/g, "&")
          optionCounts[decodedAnswer] = (optionCounts[decodedAnswer] || 0) + 1
        }
      }
    })

    const labels = Object.keys(optionCounts).filter(key => optionCounts[key] > 0)
    const data = labels.map(label => optionCounts[label])

    return {
      questionId: question.question_id,
      questionText: question.question_text,
      questionType: question.question_type,
      chartType: 'pie',
      totalResponses: answers.length,
      data: {
        labels,
        datasets: [{
          label: 'Responses',
          data,
          backgroundColor: labels.map((_, i) => this.COLORS[i % this.COLORS.length])
        }]
      }
    }
  }

  /**
   * Create bar chart for multiple-choice questions
   */
  private static createBarChart(question: EcellQuestion, answers: any[]): ChartDataset {
    const optionCounts: Record<string, number> = {}

    // Initialize counts for all options
    question.options?.forEach(option => {
      optionCounts[option.label] = 0
    })

    // Count responses (answers can be arrays for multiple choice)
    answers.forEach(answer => {
      if (Array.isArray(answer)) {
        answer.forEach(value => {
          const option = question.options?.find(opt => opt.value === value)
          if (option) {
            optionCounts[option.label]++
          } else if (typeof value === 'string') {
            optionCounts[value] = (optionCounts[value] || 0) + 1
          }
        })
      } else {
        const option = question.options?.find(opt => opt.value === answer)
        if (option) {
          optionCounts[option.label]++
        } else if (typeof answer === 'string') {
          optionCounts[answer] = (optionCounts[answer] || 0) + 1
        }
      }
    })

    const labels = Object.keys(optionCounts).filter(key => optionCounts[key] > 0)
    const data = labels.map(label => optionCounts[label])

    return {
      questionId: question.question_id,
      questionText: question.question_text,
      questionType: question.question_type,
      chartType: 'bar',
      totalResponses: answers.length,
      data: {
        labels,
        datasets: [{
          label: 'Count',
          data,
          backgroundColor: this.COLORS[0],
          borderColor: this.COLORS[1]
        }]
      }
    }
  }



  /**
   * Generate submission trends over time
   */
  static generateSubmissionTrends(submissions: Submission[]): ChartDataset {
    const dailyCounts: Record<string, number> = {}

    // Group submissions by date
    submissions.forEach(sub => {
      const date = new Date(sub.created_at).toLocaleDateString()
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })

    // Sort dates and get last 30 days
    const sortedDates = Object.keys(dailyCounts).sort()
    const last30Days = sortedDates.slice(-30)

    return {
      questionId: 'submission_trends',
      questionText: 'Submission Trends Over Time',
      questionType: 'trend',
      chartType: 'line',
      totalResponses: submissions.length,
      data: {
        labels: last30Days,
        datasets: [{
          label: 'Daily Submissions',
          data: last30Days.map(date => dailyCounts[date]),
          backgroundColor: this.COLORS[0],
          borderColor: this.COLORS[1]
        }]
      }
    }
  }
}
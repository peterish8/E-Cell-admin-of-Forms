import type { EcellQuestion } from "./types"

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  questions: Omit<EcellQuestion, "id" | "form_id" | "created_at">[]
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "ecell-evaluation-2024",
    name: "E-Cell Evaluation 2024",
    description: "Comprehensive evaluation form for E-Cell activities and interests",
    category: "evaluation",
    questions: [
      {
        question_text: "What's your startup vibe?",
        question_id: "startup_vibe",
        question_type: "single",
        options: [
          { label: "Dreamer - I have big ideas", value: "dreamer" },
          { label: "Builder - I love creating things", value: "builder" },
          { label: "Problem-Solver - I fix what's broken", value: "problem_solver" },
          { label: "Hustler - I make things happen", value: "hustler" }
        ],
        is_required: true,
        order_number: 1,
        placeholder: null
      },
      {
        question_text: "Which tech areas interest you most?",
        question_id: "tech_interests",
        question_type: "multiple",
        options: [
          { label: "Web Development", value: "web_dev" },
          { label: "AI/Machine Learning", value: "ai_ml" },
          { label: "Mobile App Development", value: "mobile_dev" },
          { label: "Blockchain", value: "blockchain" },
          { label: "IoT", value: "iot" },
          { label: "Data Science", value: "data_science" }
        ],
        is_required: true,
        order_number: 2,
        placeholder: null
      },
      {
        question_text: "What role do you see yourself in a startup team?",
        question_id: "team_role",
        question_type: "single",
        options: [
          { label: "CEO/Founder", value: "ceo" },
          { label: "CTO/Tech Lead", value: "cto" },
          { label: "Product Manager", value: "pm" },
          { label: "Developer", value: "developer" },
          { label: "Designer", value: "designer" },
          { label: "Marketing", value: "marketing" }
        ],
        is_required: true,
        order_number: 3,
        placeholder: null
      },
      {
        question_text: "What type of E-Cell activities interest you most?",
        question_id: "activity_preferences",
        question_type: "multiple",
        options: [
          { label: "Workshops & Training", value: "workshops" },
          { label: "Hackathons", value: "hackathons" },
          { label: "Pitch Competitions", value: "pitch_competitions" },
          { label: "Networking Events", value: "networking" },
          { label: "Mentorship Programs", value: "mentorship" },
          { label: "Startup Visits", value: "startup_visits" }
        ],
        is_required: true,
        order_number: 4,
        placeholder: null
      },
      {
        question_text: "Your email address",
        question_id: "email",
        question_type: "email",
        options: null,
        is_required: true,
        order_number: 5,
        placeholder: "Enter your email address"
      },
      {
        question_text: "Tell us about your startup idea or project (optional)",
        question_id: "startup_idea",
        question_type: "text",
        options: null,
        is_required: false,
        order_number: 6,
        placeholder: "Describe your startup idea or current project..."
      }
    ]
  },
  {
    id: "tech-interest-survey",
    name: "Tech Interest Survey",
    description: "Quick survey to understand student technology interests",
    category: "survey",
    questions: [
      {
        question_text: "Which programming languages do you know?",
        question_id: "programming_languages",
        question_type: "multiple",
        options: [
          { label: "JavaScript", value: "javascript" },
          { label: "Python", value: "python" },
          { label: "Java", value: "java" },
          { label: "C++", value: "cpp" },
          { label: "React", value: "react" },
          { label: "Node.js", value: "nodejs" }
        ],
        is_required: true,
        order_number: 1,
        placeholder: null
      },
      {
        question_text: "What's your experience level?",
        question_id: "experience_level",
        question_type: "single",
        options: [
          { label: "Beginner (0-1 years)", value: "beginner" },
          { label: "Intermediate (1-3 years)", value: "intermediate" },
          { label: "Advanced (3+ years)", value: "advanced" }
        ],
        is_required: true,
        order_number: 2,
        placeholder: null
      },
      {
        question_text: "Your email",
        question_id: "email",
        question_type: "email",
        options: null,
        is_required: true,
        order_number: 3,
        placeholder: "your.email@example.com"
      }
    ]
  },
  {
    id: "event-feedback",
    name: "Event Feedback Form",
    description: "Collect feedback after E-Cell events",
    category: "feedback",
    questions: [
      {
        question_text: "How would you rate this event overall?",
        question_id: "overall_rating",
        question_type: "single",
        options: [
          { label: "Excellent", value: "excellent" },
          { label: "Good", value: "good" },
          { label: "Average", value: "average" },
          { label: "Poor", value: "poor" }
        ],
        is_required: true,
        order_number: 1,
        placeholder: null
      },
      {
        question_text: "What did you like most about the event?",
        question_id: "liked_most",
        question_type: "multiple",
        options: [
          { label: "Content Quality", value: "content" },
          { label: "Speaker Expertise", value: "speaker" },
          { label: "Networking Opportunities", value: "networking" },
          { label: "Organization", value: "organization" },
          { label: "Venue", value: "venue" }
        ],
        is_required: true,
        order_number: 2,
        placeholder: null
      },
      {
        question_text: "Any suggestions for improvement?",
        question_id: "suggestions",
        question_type: "text",
        options: null,
        is_required: false,
        order_number: 3,
        placeholder: "Share your suggestions..."
      },
      {
        question_text: "Your email (optional)",
        question_id: "email",
        question_type: "email",
        options: null,
        is_required: false,
        order_number: 4,
        placeholder: "your.email@example.com"
      }
    ]
  }
]

export function getTemplateById(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find(template => template.id === id)
}

export function getTemplatesByCategory(category: string): FormTemplate[] {
  return FORM_TEMPLATES.filter(template => template.category === category)
}

export function getAllCategories(): string[] {
  return [...new Set(FORM_TEMPLATES.map(template => template.category))]
}
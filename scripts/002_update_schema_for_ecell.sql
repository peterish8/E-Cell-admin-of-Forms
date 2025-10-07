-- Update schema to match E-Cell requirements exactly
-- Rename tables to match the specification

-- Create ecell_forms table (rename from forms)
CREATE TABLE IF NOT EXISTS public.ecell_forms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create ecell_questions table (enhanced from questions)
CREATE TABLE IF NOT EXISTS public.ecell_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id uuid REFERENCES ecell_forms(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_id text NOT NULL,
  question_type text CHECK (question_type IN ('single', 'multiple', 'text', 'email', 'fill')),
  options jsonb, -- For MCQ options: [{"label": "Option 1", "value": "opt1"}]
  is_required boolean DEFAULT true,
  order_number integer,
  placeholder text,
  created_at timestamptz DEFAULT now()
);

-- Add form_id to existing submissions table
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS form_id uuid REFERENCES ecell_forms(id);

-- No flat responses table needed - using dynamic JSON approach

-- Enable RLS on new tables only (submissions already exists)
ALTER TABLE public.ecell_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecell_questions ENABLE ROW LEVEL SECURITY;

-- Simplified RLS Policies (no admin restrictions for now)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ecell_forms' AND policyname = 'Allow all operations on ecell_forms') THEN
    CREATE POLICY "Allow all operations on ecell_forms"
      ON public.ecell_forms FOR ALL
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ecell_questions' AND policyname = 'Allow all operations on ecell_questions') THEN
    CREATE POLICY "Allow all operations on ecell_questions"
      ON public.ecell_questions FOR ALL
      USING (true);
  END IF;
END $$;

-- Submissions table policies already exist

-- No RLS policies needed for removed table

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ecell_questions_form_id ON public.ecell_questions(form_id);
CREATE INDEX IF NOT EXISTS idx_ecell_questions_order ON public.ecell_questions(form_id, order_number);
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON public.submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at);
-- No indexes needed for removed table

-- No trigger function needed - using dynamic JSON approach

-- Migration: Copy data from existing tables if they exist
DO $$
BEGIN
  -- Copy forms to ecell_forms
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'forms') THEN
    INSERT INTO ecell_forms (id, name, description, is_active, created_at)
    SELECT id, title, description, (status = 'active'), created_at
    FROM forms
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Copy questions to ecell_questions
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'questions') THEN
    INSERT INTO ecell_questions (id, form_id, question_text, question_id, question_type, options, is_required, order_number, created_at)
    SELECT 
      id, 
      form_id, 
      question_text, 
      COALESCE('q_' || order_index::text, 'q_' || id), 
      CASE 
        WHEN question_type = 'radio' THEN 'single'
        WHEN question_type = 'checkbox' THEN 'multiple'
        WHEN question_type IN ('text', 'email') THEN question_type
        ELSE 'text'
      END,
      CASE 
        WHEN options IS NOT NULL AND jsonb_array_length(options) > 0 THEN
          (SELECT jsonb_agg(jsonb_build_object('label', value, 'value', value))
           FROM jsonb_array_elements_text(options) AS value)
        ELSE NULL
      END,
      is_required,
      order_index,
      created_at
    FROM questions
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Update existing submissions with form_id if responses table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'responses') THEN
    UPDATE submissions 
    SET form_id = r.form_id 
    FROM responses r 
    WHERE submissions.id = r.id AND submissions.form_id IS NULL;
  END IF;
END $$;
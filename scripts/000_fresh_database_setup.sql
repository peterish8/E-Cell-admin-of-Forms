-- Clean slate: Drop existing tables if they exist
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.ecell_questions CASCADE;
DROP TABLE IF EXISTS public.ecell_forms CASCADE;
DROP TABLE IF EXISTS public.responses CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.forms CASCADE;

-- Create forms table
CREATE TABLE public.ecell_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  custom_slug text UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE public.ecell_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.ecell_forms(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_id text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('text', 'email', 'single', 'multiple', 'fill')),
  options jsonb,
  is_required boolean DEFAULT true,
  order_number integer NOT NULL,
  placeholder text,
  created_at timestamptz DEFAULT now()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.ecell_forms(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_ecell_questions_form_id ON public.ecell_questions(form_id);
CREATE INDEX idx_ecell_questions_order ON public.ecell_questions(form_id, order_number);
CREATE INDEX idx_submissions_form_id ON public.submissions(form_id);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at);
CREATE UNIQUE INDEX idx_ecell_forms_custom_slug ON public.ecell_forms(custom_slug) WHERE custom_slug IS NOT NULL;

-- Add constraint for custom slug format
ALTER TABLE public.ecell_forms ADD CONSTRAINT check_custom_slug_format 
CHECK (custom_slug IS NULL OR custom_slug ~ '^[a-zA-Z0-9_-]+$');

-- Enable RLS
ALTER TABLE public.ecell_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecell_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on ecell_forms"
  ON public.ecell_forms FOR ALL
  USING (true);

CREATE POLICY "Allow all operations on ecell_questions"
  ON public.ecell_questions FOR ALL
  USING (true);

CREATE POLICY "Allow all operations on submissions"
  ON public.submissions FOR ALL
  USING (true);

-- Insert sample data for testing
INSERT INTO public.ecell_forms (name, description, custom_slug, is_active) VALUES
('Sample Feedback Form', 'A sample form to test the system', 'sample-feedback', true);

-- Get the form ID for sample questions
DO $$
DECLARE
    sample_form_id uuid;
BEGIN
    SELECT id INTO sample_form_id FROM public.ecell_forms WHERE custom_slug = 'sample-feedback';
    
    INSERT INTO public.ecell_questions (form_id, question_text, question_id, question_type, options, is_required, order_number, placeholder) VALUES
    (sample_form_id, 'What is your name?', 'name', 'text', null, true, 1, 'Enter your full name'),
    (sample_form_id, 'What is your email?', 'email', 'email', null, true, 2, 'Enter your email address'),
    (sample_form_id, 'How would you rate our service?', 'rating', 'single', '[{"label": "Excellent", "value": "excellent"}, {"label": "Good", "value": "good"}, {"label": "Average", "value": "average"}, {"label": "Poor", "value": "poor"}]', true, 3, null),
    (sample_form_id, 'Which features do you use?', 'features', 'multiple', '[{"label": "Dashboard", "value": "dashboard"}, {"label": "Analytics", "value": "analytics"}, {"label": "Reports", "value": "reports"}, {"label": "API", "value": "api"}]', false, 4, null);
END $$;
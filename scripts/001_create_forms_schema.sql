-- Create forms table
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms
CREATE POLICY "Allow admins to view all forms"
  ON public.forms FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to insert forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow admins to update forms"
  ON public.forms FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Allow admins to delete forms"
  ON public.forms FOR DELETE
  USING (auth.uid() = created_by);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file')),
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
CREATE POLICY "Allow everyone to view questions"
  ON public.questions FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to insert questions"
  ON public.questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = questions.form_id 
    AND forms.created_by = auth.uid()
  ));

CREATE POLICY "Allow admins to update questions"
  ON public.questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = questions.form_id 
    AND forms.created_by = auth.uid()
  ));

CREATE POLICY "Allow admins to delete questions"
  ON public.questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = questions.form_id 
    AND forms.created_by = auth.uid()
  ));

-- Create responses table
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  respondent_email TEXT
);

-- Enable RLS
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for responses
CREATE POLICY "Allow everyone to insert responses"
  ON public.responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow admins to view responses"
  ON public.responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = responses.form_id 
    AND forms.created_by = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_form_id ON public.questions(form_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON public.questions(form_id, order_index);
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON public.responses(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_submitted_at ON public.responses(submitted_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to forms table
DROP TRIGGER IF EXISTS update_forms_updated_at ON public.forms;
CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

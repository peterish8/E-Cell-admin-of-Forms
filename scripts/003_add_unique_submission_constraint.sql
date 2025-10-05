-- Add unique constraint for one submission per user per form
ALTER TABLE public.submissions 
ADD CONSTRAINT unique_user_form_submission 
UNIQUE (email, form_id);

-- Add index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_submissions_email_form ON public.submissions(email, form_id);
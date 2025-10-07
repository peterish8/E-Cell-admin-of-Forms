-- Add custom slug field to ecell_forms table
ALTER TABLE public.ecell_forms ADD COLUMN IF NOT EXISTS custom_slug text;

-- Create unique index on custom_slug to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_ecell_forms_custom_slug ON public.ecell_forms(custom_slug) WHERE custom_slug IS NOT NULL;

-- Add constraint to ensure slug format (alphanumeric, hyphens, underscores only)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_custom_slug_format') THEN
    ALTER TABLE public.ecell_forms ADD CONSTRAINT check_custom_slug_format 
    CHECK (custom_slug IS NULL OR custom_slug ~ '^[a-zA-Z0-9_-]+$');
  END IF;
END $$;
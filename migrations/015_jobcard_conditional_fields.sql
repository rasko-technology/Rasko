-- Add columns for conditional fields in job card form
ALTER TABLE public.jobcards
ADD COLUMN IF NOT EXISTS purchase_date date,
ADD COLUMN IF NOT EXISTS courier_name text,
ADD COLUMN IF NOT EXISTS courier_date date,
ADD COLUMN IF NOT EXISTS doc_number text;
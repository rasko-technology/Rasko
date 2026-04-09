-- =====================================================
-- Migration: Add edit/closing fields to jobcards
-- Fields for: engineer observations, customer notes,
-- action taken, repair status, closing status, etc.
-- =====================================================

ALTER TABLE public.jobcards
ADD COLUMN IF NOT EXISTS engineer_observations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS engineer_observation_notes text,
ADD COLUMN IF NOT EXISTS customer_notes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS customer_note_text text,
ADD COLUMN IF NOT EXISTS action_taken jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS receiver_same_as_customer boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS original_jobsheet_received boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS repair_status text DEFAULT 'open',
ADD COLUMN IF NOT EXISTS closing_date_time timestamptz,
ADD COLUMN IF NOT EXISTS closing_status text,
ADD COLUMN IF NOT EXISTS receiver_image text;

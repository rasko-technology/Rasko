-- Add booking_date_time and inspection_charges columns to jobcards
ALTER TABLE public.jobcards
ADD COLUMN IF NOT EXISTS booking_date_time timestamptz DEFAULT now (),
ADD COLUMN IF NOT EXISTS inspection_charges numeric DEFAULT 0;
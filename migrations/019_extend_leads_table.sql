-- =====================================================
-- Migration: Extend leads table for full lead management
-- =====================================================

-- Add new columns to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS customer_id integer REFERENCES public.customers(id),
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS user_type text,
  ADD COLUMN IF NOT EXISTS incoming_source text,
  ADD COLUMN IF NOT EXISTS advance_amount numeric(10, 2),
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS booking_date_time timestamptz,
  ADD COLUMN IF NOT EXISTS product_requirements jsonb DEFAULT '[]'::jsonb;

-- Index for customer lookups
CREATE INDEX IF NOT EXISTS idx_leads_customer ON public.leads (customer_id);

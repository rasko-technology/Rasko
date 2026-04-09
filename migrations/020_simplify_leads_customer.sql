-- =====================================================
-- Migration: Simplify leads table - use customer_id only
-- Removes redundant customer_name, phone, email, address, city columns
-- Makes customer_id required
-- =====================================================
-- Make customer_id NOT NULL (must have a linked customer)
ALTER TABLE public.leads
ALTER COLUMN customer_id
SET
    NOT NULL;

-- Drop redundant columns (customer data lives in customers table)
ALTER TABLE public.leads
DROP COLUMN IF EXISTS customer_name,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS city;

-- Add assigned_to column if missing
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS assigned_to integer REFERENCES public.employees (id);
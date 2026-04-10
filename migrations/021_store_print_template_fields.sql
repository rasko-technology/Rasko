-- Add print template fields to stores table
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS tagline text,
ADD COLUMN IF NOT EXISTS gstin text,
ADD COLUMN IF NOT EXISTS pan text,
ADD COLUMN IF NOT EXISTS inspection_charges numeric(10, 2),
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_ifsc_code text,
ADD COLUMN IF NOT EXISTS bank_branch_name text,
ADD COLUMN IF NOT EXISTS bank_account_holder_name text,
ADD COLUMN IF NOT EXISTS bank_account_number text,
ADD COLUMN IF NOT EXISTS bank_upi_id text,
ADD COLUMN IF NOT EXISTS general_terms text;
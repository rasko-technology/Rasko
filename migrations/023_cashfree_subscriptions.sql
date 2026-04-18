-- =====================================================
-- Migration: Revamp subscriptions table for Cashfree integration
-- Adds Cashfree subscription IDs, plan tracking, and webhook log
-- =====================================================

-- Drop the old subscriptions table columns and rebuild
-- Keep existing rows by adding columns incrementally

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS cashfree_subscription_id text,
ADD COLUMN IF NOT EXISTS cashfree_plan_id text,
ADD COLUMN IF NOT EXISTS plan_amount integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_interval text DEFAULT 'month',
ADD COLUMN IF NOT EXISTS trial_end_date timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS payment_link text;

-- Update plan column to use new values: 'free_trial', 'monthly', 'yearly'
-- Existing 'free' plans become 'free_trial'
UPDATE public.subscriptions SET plan = 'free_trial' WHERE plan = 'free';

-- Create index on cashfree_subscription_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_cashfree_sub_id
ON public.subscriptions(cashfree_subscription_id);

-- Create webhook events log for idempotency and debugging
CREATE TABLE IF NOT EXISTS public.subscription_webhook_events (
  id bigint generated always as identity primary key,
  event_id text NOT NULL,
  event_type text NOT NULL,
  cashfree_subscription_id text,
  payment_id text,
  payload jsonb NOT NULL DEFAULT '{}',
  processed_at timestamptz DEFAULT now(),
  UNIQUE(event_id)
);

-- RLS: webhook events only accessible via service role
ALTER TABLE public.subscription_webhook_events ENABLE ROW LEVEL SECURITY;

-- Update the create_store_with_membership RPC to use free_trial with 30-day period
CREATE OR REPLACE FUNCTION public.create_store_with_membership(
  p_name text,
  p_address text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_pincode text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_address_lat double precision DEFAULT NULL,
  p_address_lng double precision DEFAULT NULL,
  p_full_address text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id bigint;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create store
  INSERT INTO stores (name, address, city, pincode, phone, email, website, address_lat, address_lng, full_address)
  VALUES (p_name, p_address, p_city, p_pincode, p_phone, p_email, p_website, p_address_lat, p_address_lng, p_full_address)
  RETURNING id INTO v_store_id;

  -- Create membership
  INSERT INTO store_members (store_id, user_id, role)
  VALUES (v_store_id, v_user_id, 'owner');

  -- Create free trial subscription (30 days)
  INSERT INTO subscriptions (store_id, plan, status, current_period_start, current_period_end, trial_end_date)
  VALUES (v_store_id, 'free_trial', 'active', now(), now() + interval '30 days', now() + interval '30 days');

  RETURN v_store_id;
END;
$$;

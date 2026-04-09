-- =====================================================
-- Migration: Add location fields to stores
-- Stores address lat/lng and full formatted address
-- =====================================================

ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS address_lat double precision,
ADD COLUMN IF NOT EXISTS address_lng double precision,
ADD COLUMN IF NOT EXISTS full_address text;

-- Update the RPC function to accept new location params
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

  -- Create free subscription
  INSERT INTO subscriptions (store_id, plan, status, current_period_start, current_period_end)
  VALUES (v_store_id, 'free', 'active', now(), now() + interval '100 years');

  RETURN v_store_id;
END;
$$;

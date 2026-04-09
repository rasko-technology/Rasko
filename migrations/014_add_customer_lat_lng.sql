-- Add lat/lng columns to customers table for storing map pin location
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS address_lat double precision;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS address_lng double precision;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS full_address text;
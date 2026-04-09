-- Add landmark column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS landmark text;

-- Add lat/lng to bookings for map pin storage
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS address_lat double precision;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS address_lng double precision;

-- Add customer_id foreign key to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS customer_id integer REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);

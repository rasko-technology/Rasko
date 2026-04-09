-- =====================================================
-- Migration: Lead Management & Booking Management
-- Run this in your Supabase SQL Editor
-- =====================================================
-- 1. Extend service_list_type enum for lead and booking lists
ALTER TYPE public.service_list_type ADD VALUE IF NOT EXISTS 'payment_mode';

ALTER TYPE public.service_list_type ADD VALUE IF NOT EXISTS 'lead_item';

ALTER TYPE public.service_list_type ADD VALUE IF NOT EXISTS 'lead_configuration';

ALTER TYPE public.service_list_type ADD VALUE IF NOT EXISTS 'lead_status';

ALTER TYPE public.service_list_type ADD VALUE IF NOT EXISTS 'lead_action_taken';

ALTER TYPE public.service_list_type ADD VALUE IF NOT EXISTS 'booking_problem';

-- 2. Create leads table
CREATE TABLE
  IF NOT EXISTS public.leads (
    id serial PRIMARY KEY,
    store_id integer NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
    customer_name text NOT NULL,
    phone text NOT NULL,
    email text,
    address text,
    item text,
    configuration text,
    quantity integer NOT NULL DEFAULT 1,
    payment_mode text,
    amount numeric(10, 2),
    status text NOT NULL DEFAULT 'new',
    action_taken text,
    notes text,
    assigned_to integer REFERENCES public.employees (id),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now ()
  );

CREATE INDEX IF NOT EXISTS idx_leads_store ON public.leads (store_id);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (store_id, status);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their store leads" ON public.leads FOR
SELECT
  USING (
    store_id IN (
      SELECT
        store_id
      FROM
        public.store_members
      WHERE
        user_id = auth.uid ()
    )
  );

CREATE POLICY "Users can insert their store leads" ON public.leads FOR INSERT
WITH
  CHECK (
    store_id IN (
      SELECT
        store_id
      FROM
        public.store_members
      WHERE
        user_id = auth.uid ()
    )
  );

CREATE POLICY "Users can update their store leads" ON public.leads FOR
UPDATE USING (
  store_id IN (
    SELECT
      store_id
    FROM
      public.store_members
    WHERE
      user_id = auth.uid ()
  )
);

CREATE POLICY "Users can delete their store leads" ON public.leads FOR DELETE USING (
  store_id IN (
    SELECT
      store_id
    FROM
      public.store_members
    WHERE
      user_id = auth.uid ()
  )
);

-- 3. Create bookings table
CREATE TABLE
  IF NOT EXISTS public.bookings (
    id serial PRIMARY KEY,
    store_id integer NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
    customer_name text NOT NULL,
    phone text NOT NULL,
    email text,
    address_street text,
    address_landmark text,
    address_town text DEFAULT 'Kadapa',
    product_name text NOT NULL,
    brand_name text NOT NULL,
    model_name text,
    problem text NOT NULL,
    remark text,
    status text NOT NULL DEFAULT 'pending',
    assigned_to integer REFERENCES public.employees (id),
    created_at timestamptz NOT NULL DEFAULT now (),
    updated_at timestamptz NOT NULL DEFAULT now ()
  );

CREATE INDEX IF NOT EXISTS idx_bookings_store ON public.bookings (store_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (store_id, status);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their store bookings" ON public.bookings FOR
SELECT
  USING (
    store_id IN (
      SELECT
        store_id
      FROM
        public.store_members
      WHERE
        user_id = auth.uid ()
    )
  );

CREATE POLICY "Users can insert their store bookings" ON public.bookings FOR INSERT
WITH
  CHECK (
    store_id IN (
      SELECT
        store_id
      FROM
        public.store_members
      WHERE
        user_id = auth.uid ()
    )
  );

CREATE POLICY "Users can update their store bookings" ON public.bookings FOR
UPDATE USING (
  store_id IN (
    SELECT
      store_id
    FROM
      public.store_members
    WHERE
      user_id = auth.uid ()
  )
);

CREATE POLICY "Users can delete their store bookings" ON public.bookings FOR DELETE USING (
  store_id IN (
    SELECT
      store_id
    FROM
      public.store_members
    WHERE
      user_id = auth.uid ()
  )
);
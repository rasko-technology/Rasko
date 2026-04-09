-- =====================================================
-- Migration: Store Service Options
-- Stores per-store service option lists for:
--   default_issue, items_received, action_taken,
--   engineer_observation, additional_requirement, customer_note
-- =====================================================
CREATE TABLE
    IF NOT EXISTS public.store_service_options (
        id serial PRIMARY KEY,
        store_id bigint NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
        option_type text NOT NULL CHECK (
            option_type IN (
                'default_issue',
                'items_received',
                'action_taken',
                'engineer_observation',
                'additional_requirement',
                'customer_note'
            )
        ),
        name text NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now (),
        UNIQUE (store_id, option_type, name)
    );

CREATE INDEX IF NOT EXISTS idx_store_service_options_store_type ON public.store_service_options (store_id, option_type);

ALTER TABLE public.store_service_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their store service options" ON public.store_service_options FOR
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

CREATE POLICY "Users can insert their store service options" ON public.store_service_options FOR INSERT
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

CREATE POLICY "Users can update their store service options" ON public.store_service_options FOR
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

CREATE POLICY "Users can delete their store service options" ON public.store_service_options FOR DELETE USING (
    store_id IN (
        SELECT
            store_id
        FROM
            public.store_members
        WHERE
            user_id = auth.uid ()
    )
);
-- =====================================================
-- Migration: Store Service Items
-- Links stores to catalog_products they service/repair
-- =====================================================
CREATE TABLE
    IF NOT EXISTS public.store_service_items (
        id serial PRIMARY KEY,
        store_id bigint NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
        catalog_product_id integer NOT NULL REFERENCES public.catalog_products (id) ON DELETE CASCADE,
        added_at timestamptz NOT NULL DEFAULT now (),
        UNIQUE (store_id, catalog_product_id)
    );

CREATE INDEX IF NOT EXISTS idx_store_service_items_store ON public.store_service_items (store_id);

ALTER TABLE public.store_service_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their store service items" ON public.store_service_items FOR
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

CREATE POLICY "Users can insert their store service items" ON public.store_service_items FOR INSERT
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

CREATE POLICY "Users can delete their store service items" ON public.store_service_items FOR DELETE USING (
    store_id IN (
        SELECT
            store_id
        FROM
            public.store_members
        WHERE
            user_id = auth.uid ()
    )
);
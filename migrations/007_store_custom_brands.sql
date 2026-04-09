-- =====================================================
-- Migration: Store Custom Brands (per product)
-- Allows stores to add private brands to specific products.
-- store_id scopes visibility so other stores cannot see them.
-- =====================================================
CREATE TABLE
    IF NOT EXISTS public.store_custom_brands (
        id serial PRIMARY KEY,
        store_id bigint NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
        catalog_product_id integer NOT NULL REFERENCES public.catalog_products (id) ON DELETE CASCADE,
        name text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now (),
        UNIQUE (store_id, catalog_product_id, name)
    );

CREATE INDEX IF NOT EXISTS idx_store_custom_brands_store ON public.store_custom_brands (store_id);

CREATE INDEX IF NOT EXISTS idx_store_custom_brands_product ON public.store_custom_brands (store_id, catalog_product_id);

ALTER TABLE public.store_custom_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their store custom brands" ON public.store_custom_brands FOR
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

CREATE POLICY "Users can insert their store custom brands" ON public.store_custom_brands FOR INSERT
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

CREATE POLICY "Users can delete their store custom brands" ON public.store_custom_brands FOR DELETE USING (
    store_id IN (
        SELECT
            store_id
        FROM
            public.store_members
        WHERE
            user_id = auth.uid ()
    )
);
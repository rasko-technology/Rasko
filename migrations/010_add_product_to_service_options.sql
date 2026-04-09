-- =====================================================
-- Migration: Add product scope to service options
-- Allows options to be per-product (via service_item_id)
-- NULL service_item_id = global/store-wide option
-- =====================================================
ALTER TABLE public.store_service_options
ADD COLUMN IF NOT EXISTS service_item_id integer REFERENCES public.store_service_items (id) ON DELETE CASCADE;

-- Drop old unique constraint and create new one that includes service_item_id
ALTER TABLE public.store_service_options
DROP CONSTRAINT IF EXISTS store_service_options_store_id_option_type_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_service_options_unique ON public.store_service_options (
    store_id,
    option_type,
    name,
    COALESCE(service_item_id, 0)
);

CREATE INDEX IF NOT EXISTS idx_store_service_options_service_item ON public.store_service_options (service_item_id)
WHERE
    service_item_id IS NOT NULL;
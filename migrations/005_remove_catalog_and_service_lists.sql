-- =====================================================
-- Migration: Remove legacy catalog and service list tables
-- =====================================================
DROP TABLE IF EXISTS public.service_list_items CASCADE;

DROP TABLE IF EXISTS public.products CASCADE;

DROP TABLE IF EXISTS public.categories CASCADE;
-- =====================================================
-- Migration: Add missing categories, brands, products
-- Adds items from new_products.ts not in 004_product_catalog_seed.sql
-- =====================================================

-- 1. New categories
INSERT INTO public.catalog_categories (name) VALUES
  ('Mobile & Telecommunications'),
  ('Physical Security & Entrance Control'),
  ('Office & Commercial Equipment'),
  ('Fitness & Wellness Equipment')
ON CONFLICT (name) DO NOTHING;

-- 2. New brands (87 missing)
INSERT INTO public.catalog_brands (name) VALUES
  ('AMD'),
  ('Amazfit'),
  ('Apollo'),
  ('Ashok Leyland'),
  ('Astrophysics'),
  ('Atlas Copco'),
  ('Audi'),
  ('Aurora'),
  ('Auto Clear'),
  ('BFT'),
  ('BHEL'),
  ('Baofeng'),
  ('BendPak'),
  ('Bonsaii'),
  ('Boon Edam'),
  ('Bowflex'),
  ('CEIA'),
  ('Came'),
  ('Cassida'),
  ('Challenger'),
  ('ChargePoint'),
  ('Coros'),
  ('Dahle'),
  ('Daiwa'),
  ('Elica'),
  ('FAAC'),
  ('Faber'),
  ('Fellowes'),
  ('Fisher Labs'),
  ('Fitbit'),
  ('Flowserve'),
  ('Fossil'),
  ('GBC'),
  ('Garrett'),
  ('Giesecke+Devrient'),
  ('Glen'),
  ('Glory'),
  ('Gobbler'),
  ('Google Pixel'),
  ('Grove'),
  ('Gunnebo'),
  ('HSM'),
  ('HellermannTyton'),
  ('Hindware'),
  ('Human Touch'),
  ('Hytera'),
  ('Icom'),
  ('Inada'),
  ('Kaff'),
  ('Kavinstar'),
  ('Kenwood'),
  ('Kobra'),
  ('Kores'),
  ('L3Harris'),
  ('Life Fitness'),
  ('Magnetic Autocontrol'),
  ('Miura'),
  ('Motorola'),
  ('Motorola Solutions'),
  ('NordicTrack'),
  ('Nothing'),
  ('Nuctech'),
  ('Octane Fitness'),
  ('Ogawa'),
  ('OnePlus'),
  ('Oppo'),
  ('Osaki'),
  ('Precor'),
  ('Rapiscan'),
  ('Rapiscan Systems'),
  ('Realme'),
  ('Renz'),
  ('Rexel'),
  ('Schwinn'),
  ('Smiths Detection'),
  ('Star Trac'),
  ('Stäubli'),
  ('Suunto'),
  ('Synology'),
  ('Technogym'),
  ('Thermax'),
  ('TruBind'),
  ('Vivo'),
  ('Xiaomi'),
  ('Yaesu'),
  ('Zoll'),
  ('be quiet!')
ON CONFLICT (name) DO NOTHING;

-- 3. Rename "Exhaust Fan" -> "Exhaust Fan / Chimney" and update brands
UPDATE public.catalog_products
SET name = 'Exhaust Fan / Chimney'
WHERE name = 'Exhaust Fan'
  AND category_id = (SELECT id FROM public.catalog_categories WHERE name = 'HVAC & Appliances');

-- Add new brand mappings for Exhaust Fan / Chimney (Faber, Elica, Kaff, Hindware, Glen are new)
DO $$
DECLARE
  v_prod_id integer;
  v_brand_id integer;
BEGIN
  SELECT id INTO v_prod_id FROM public.catalog_products
    WHERE name = 'Exhaust Fan / Chimney'
      AND category_id = (SELECT id FROM public.catalog_categories WHERE name = 'HVAC & Appliances');

  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Faber','Elica','Kaff','Hindware','Glen') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- 4. Insert new products + brand mappings
DO $$
DECLARE
  v_cat_id integer;
  v_prod_id integer;
  v_brand_id integer;
BEGIN

  -- ========================
  -- Mobile & Telecommunications
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Mobile & Telecommunications';

  -- Smartphone / Mobile Phone
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Smartphone / Mobile Phone') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Smartphone / Mobile Phone'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Apple','Samsung','Xiaomi','Vivo','Oppo','OnePlus','Google Pixel','Motorola','Realme','Nothing') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Smartwatch / Wearable
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Smartwatch / Wearable') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Smartwatch / Wearable'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Apple','Samsung','Garmin','Fitbit','Amazfit','Fossil','Suunto','Coros') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Two-Way Radio / Walkie-Talkie
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Two-Way Radio / Walkie-Talkie') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Two-Way Radio / Walkie-Talkie'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Motorola Solutions','Kenwood','Hytera','Icom','Baofeng','Yaesu') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Physical Security & Entrance Control
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Physical Security & Entrance Control';

  -- Baggage X-Ray Scanner
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Baggage X-Ray Scanner') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Baggage X-Ray Scanner'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Smiths Detection','Rapiscan Systems','Astrophysics','Nuctech','Auto Clear','L3Harris') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Boom Barrier / Turnstile
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Boom Barrier / Turnstile') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Boom Barrier / Turnstile'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Magnetic Autocontrol','FAAC','BFT','Came','Gunnebo','ZKTeco','Boon Edam') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Metal Detector (DFMD / HHMD)
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Metal Detector (DFMD / HHMD)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Metal Detector (DFMD / HHMD)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Garrett','CEIA','Fisher Labs','Rapiscan','ZKTeco') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Office & Commercial Equipment
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Office & Commercial Equipment';

  -- Paper Shredder
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Paper Shredder') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Paper Shredder'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Fellowes','HSM','Dahle','Kobra','Rexel','Aurora','Bonsaii') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Currency Counting Machine
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Currency Counting Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Currency Counting Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Godrej','Kores','Cassida','Glory','Giesecke+Devrient','Kavinstar','Gobbler') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Binding Machine
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Binding Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Binding Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Fellowes','GBC','Renz','Kores','TruBind') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Fitness & Wellness Equipment
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Fitness & Wellness Equipment';

  -- Treadmill (Commercial & Home)
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Treadmill (Commercial & Home)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Treadmill (Commercial & Home)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Life Fitness','Precor','Matrix','Technogym','NordicTrack','Star Trac','Bowflex') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Elliptical / Cross Trainer
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Elliptical / Cross Trainer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Elliptical / Cross Trainer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Precor','Life Fitness','Matrix','Technogym','Octane Fitness','Schwinn') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Massage Chair
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Massage Chair') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Massage Chair'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Osaki','Human Touch','Panasonic','Ogawa','Inada','Daiwa') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Automotive (new brands for existing products)
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Automotive';

  -- Passenger Car: add Audi (new brand)
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Passenger Car';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Audi') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- SUV / Crossover: add Audi
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'SUV / Crossover';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Audi') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- EV Charging Station: add ChargePoint
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'EV Charging Station';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('ChargePoint') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Commercial Truck: add Ashok Leyland
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Commercial Truck';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Ashok Leyland') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Bus: add Ashok Leyland
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Bus';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Ashok Leyland') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Automotive Lift / Hoist: add BendPak, Challenger
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Automotive Lift / Hoist';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('BendPak','Challenger') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Tyre: add Apollo
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Tyre';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Apollo') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- ========================
  -- Industrial & Heavy Machinery (new brands)
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Industrial & Heavy Machinery';

  -- Air Compressor: add Atlas Copco
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Air Compressor';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Atlas Copco') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Industrial Pump: add Flowserve
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial Pump';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Flowserve') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Industrial Boiler: add Thermax, Miura
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial Boiler';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Thermax','Miura') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Cooling Tower: add Thermax
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Cooling Tower';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Thermax') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Industrial Robot: add Stäubli
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial Robot';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Stäubli') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Transformer: add BHEL
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Transformer';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('BHEL') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Crane (Mobile): add Grove
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Crane (Mobile)';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Grove') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- ========================
  -- Medical Equipment (new brands)
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Medical Equipment';

  -- Defibrillator (AED): add Zoll
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Defibrillator (AED)';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Zoll') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- ========================
  -- Computing Devices (new brands for existing products)
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Computing Devices';

  -- Laptop: add Huawei MateBook, LG Gram (already exist as brands)
  -- Graphics Card: add AMD
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Graphics Card (GPU)';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('AMD') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Processor: add AMD
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Processor (CPU)';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('AMD') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Power Supply Unit: add be quiet!
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Power Supply Unit (PSU)';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('be quiet!') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- PC Cabinet / Case: add be quiet!
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'PC Cabinet / Case';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('be quiet!') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- CPU Cooler: add be quiet!
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'CPU Cooler';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('be quiet!') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- ========================
  -- IT Appliances (new brands)
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'IT Appliances';

  -- NAS: add Synology
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Network Attached Storage (NAS)';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Synology') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Structured Cabling: add HellermannTyton
  SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Structured Cabling System';
  IF v_prod_id IS NOT NULL THEN
    FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('HellermannTyton') LOOP
      INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

END $$;

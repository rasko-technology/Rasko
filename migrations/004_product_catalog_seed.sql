-- =====================================================
-- Migration: Global Product Catalog (Normalized)
-- Three lookup tables + junction for product-brand mapping
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Categories table
CREATE TABLE IF NOT EXISTS public.catalog_categories (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read catalog_categories" ON public.catalog_categories FOR SELECT USING (true);

-- 2. Products table
CREATE TABLE IF NOT EXISTS public.catalog_products (
  id serial PRIMARY KEY,
  category_id integer NOT NULL REFERENCES public.catalog_categories (id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, name)
);

CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON public.catalog_products (category_id);

ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read catalog_products" ON public.catalog_products FOR SELECT USING (true);

-- 3. Brands table
CREATE TABLE IF NOT EXISTS public.catalog_brands (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read catalog_brands" ON public.catalog_brands FOR SELECT USING (true);

-- 4. Product-Brand junction table
CREATE TABLE IF NOT EXISTS public.catalog_product_brands (
  product_id integer NOT NULL REFERENCES public.catalog_products (id) ON DELETE CASCADE,
  brand_id integer NOT NULL REFERENCES public.catalog_brands (id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, brand_id)
);

ALTER TABLE public.catalog_product_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read catalog_product_brands" ON public.catalog_product_brands FOR SELECT USING (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- 5. Insert categories
INSERT INTO public.catalog_categories (name) VALUES
  ('HVAC & Appliances'),
  ('Electronics & IT'),
  ('IT Appliances'),
  ('Computing Devices'),
  ('Automotive'),
  ('Medical Equipment'),
  ('Industrial & Heavy Machinery')
ON CONFLICT (name) DO NOTHING;

-- 6. Insert brands (all unique brands across all categories)
INSERT INTO public.catalog_brands (name) VALUES
  ('3CX'),
  ('3D Systems'),
  ('A&D Medical'),
  ('A-dec'),
  ('A.O. Smith'),
  ('A10 Networks'),
  ('ABUS'),
  ('ABB'),
  ('AEG'),
  ('AFL'),
  ('Aalborg'),
  ('Abbott'),
  ('Acer'),
  ('Acer Aspire'),
  ('Acer Chromebook'),
  ('Acer Predator'),
  ('Adder'),
  ('Advantech'),
  ('APC'),
  ('APC (Schneider Electric)'),
  ('AWS WAF'),
  ('Agilia'),
  ('Ahuja'),
  ('Aida'),
  ('Akamai'),
  ('Alcon'),
  ('Alienware'),
  ('Alienware (Dell)'),
  ('Alliance Laundry Systems'),
  ('Alpine'),
  ('ALVO'),
  ('Amara Raja (Amaron)'),
  ('Amazon Echo'),
  ('Amazon Fire'),
  ('American Standard'),
  ('Anker'),
  ('Ansul'),
  ('Antec'),
  ('Aprilaire'),
  ('Apple'),
  ('Apple (M-series)'),
  ('Apple HomePod'),
  ('Apple iMac'),
  ('Apple Mac Mini'),
  ('Apple Mac Pro'),
  ('Apple MacBook Pro'),
  ('Apple MagSafe'),
  ('Apple iPad'),
  ('Aquaguard'),
  ('Arburg'),
  ('Arctic'),
  ('ArjoHuntleigh'),
  ('ASRock'),
  ('ASSA ABLOY'),
  ('Astoria'),
  ('Asus'),
  ('Asus Chromebook'),
  ('Asus PN Series'),
  ('Asus ProArt'),
  ('Asus ProArt Studiobook'),
  ('ASUS ROG'),
  ('Asus ROG'),
  ('Asus ZenBook Flip'),
  ('Asus ZenPad'),
  ('Asustor'),
  ('Aten'),
  ('Ather'),
  ('Atom Medical'),
  ('Autel'),
  ('Avaya'),
  ('Aware'),
  ('Axis'),
  ('AOC'),
  ('Babcock & Wilcox'),
  ('Bajaj'),
  ('Baltimore Aircoil'),
  ('Barco'),
  ('Barracuda'),
  ('Baxter'),
  ('B. Braun'),
  ('BD'),
  ('Bausch + Lomb'),
  ('Beckman Coulter'),
  ('Beckhoff'),
  ('Beckwood'),
  ('Beelink'),
  ('Belimed'),
  ('Belkin'),
  ('Belden'),
  ('BenQ'),
  ('Beverage-Air'),
  ('Big Ass Fans'),
  ('Bissell'),
  ('Bitzer'),
  ('Black Box'),
  ('Bliss Industries'),
  ('Blue Star'),
  ('Blueair'),
  ('BlueCat'),
  ('BMW'),
  ('Bosch'),
  ('Bose'),
  ('Bose Professional'),
  ('Brandon Medical'),
  ('Brentwood'),
  ('Breville'),
  ('Bridgestone'),
  ('BrightSign'),
  ('Broan'),
  ('Brother'),
  ('Bruker'),
  ('Bryant'),
  ('Buffalo'),
  ('BYD'),
  ('CalDigit'),
  ('Canon'),
  ('Canon Medical'),
  ('Cardiac Science'),
  ('Carl Zeiss'),
  ('Carrier'),
  ('Case CE'),
  ('Caterpillar'),
  ('CEAT'),
  ('CEMB'),
  ('Cherry'),
  ('Chevrolet'),
  ('Check Point'),
  ('Christie'),
  ('Cisco'),
  ('Cisco ASA'),
  ('Cisco HyperFlex'),
  ('Cisco IronPort'),
  ('Cisco Meraki'),
  ('Cisco UCS'),
  ('Cisco Viptela'),
  ('Citrix ADC'),
  ('Citrix Ready'),
  ('Cleaver-Brooks'),
  ('Cloudflare'),
  ('Club Car'),
  ('Coesia'),
  ('Cogent'),
  ('Cognex'),
  ('CommScope'),
  ('CompAir'),
  ('Continental'),
  ('Contec'),
  ('Cooler Master'),
  ('Corghi'),
  ('Corning'),
  ('Cornelius'),
  ('Corsair'),
  ('Coway'),
  ('Crane'),
  ('Creality'),
  ('Crestron'),
  ('Crompton'),
  ('Crompton Greaves'),
  ('Crown'),
  ('Crucial'),
  ('Culligan'),
  ('Cummins'),
  ('CyberPower'),
  ('D-Link'),
  ('Dahua'),
  ('Daifuku'),
  ('Daikin'),
  ('Danfoss'),
  ('Daon'),
  ('Das Keyboard'),
  ('Datalogic'),
  ('Deepcool'),
  ('Dell'),
  ('Dell Chromebook'),
  ('Dell EMC'),
  ('Dell EMC DataDomain'),
  ('Dell EMC VxRail'),
  ('Dell Latitude'),
  ('Dell Latitude Rugged'),
  ('Dell OptiPlex Micro'),
  ('Dell Precision'),
  ('Dell Precision Mobile'),
  ('Dell Wyse'),
  ('Dell XPS 2-in-1'),
  ('Delphi'),
  ('Delta'),
  ('Demag'),
  ('Dematic'),
  ('Dentsply Sirona'),
  ('Desktop Metal'),
  ('Deutz'),
  ('Dexter Laundry'),
  ('Diebold'),
  ('Diebold Nixdorf'),
  ('Digi'),
  ('Digi International'),
  ('DirexGroup'),
  ('DMG Mori'),
  ('Doosan'),
  ('Dorner'),
  ('Dornier MedTech'),
  ('Drager'),
  ('Ducati'),
  ('Dunham-Bush'),
  ('Dunlop'),
  ('Dyson'),
  ('Eaton'),
  ('EcoSmart'),
  ('EDAP TMS'),
  ('EfficientIP'),
  ('Eicher'),
  ('Eizo'),
  ('Electrolux'),
  ('Electrolux Professional'),
  ('Elgato'),
  ('Elgi'),
  ('Elkon'),
  ('Elo Touch Solutions'),
  ('Emerson'),
  ('Engel'),
  ('Enphase'),
  ('Entrust'),
  ('EOS'),
  ('Eppendorf'),
  ('Epson'),
  ('Erba'),
  ('Esaote'),
  ('ESAB'),
  ('Escorts'),
  ('eSSL'),
  ('Eureka Forbes'),
  ('EVGA'),
  ('Evapco'),
  ('ExaGrid'),
  ('Exicom'),
  ('Exide'),
  ('Extreme Networks'),
  ('EZ-GO'),
  ('F5'),
  ('F5 Networks'),
  ('Faema'),
  ('Fanem'),
  ('Fanuc'),
  ('Follett'),
  ('Forbes Marshall'),
  ('Ford'),
  ('Formlabs'),
  ('Fortinet'),
  ('Fortinet FortiGate'),
  ('Forward Lift'),
  ('Fractal Design'),
  ('Freightliner'),
  ('Fresenius Kabi'),
  ('Fresenius Medical Care'),
  ('Frigidaire'),
  ('Fronius'),
  ('Fuji Electric'),
  ('Fujitsu'),
  ('Fujitsu Celsius'),
  ('Fujitsu Lifebook'),
  ('Fujitec'),
  ('Fujifilm'),
  ('Futurex'),
  ('FUSO'),
  ('G-Technology'),
  ('G.Skill'),
  ('Gardner Denver'),
  ('Garia'),
  ('Garmin'),
  ('GE'),
  ('GE Healthcare'),
  ('Genetec'),
  ('Geotab'),
  ('Getac'),
  ('Getinge'),
  ('GH Cranes'),
  ('Gigabyte'),
  ('Gigabyte Aorus'),
  ('Girbau'),
  ('Godrej'),
  ('Goodman'),
  ('Google Nest'),
  ('Google Pixelbook'),
  ('Goodyear'),
  ('Grandstream'),
  ('Gree'),
  ('Greenerd'),
  ('GRG Banking'),
  ('Growatt'),
  ('Grundfos'),
  ('Guntermann & Drunck'),
  ('Haas'),
  ('Haag-Streit'),
  ('Haier'),
  ('Haitian'),
  ('Hamilton Medical'),
  ('Handheld Group'),
  ('Hanwha'),
  ('Harley-Davidson'),
  ('Harman Kardon'),
  ('Havells'),
  ('HAProxy'),
  ('Hero MotoCorp'),
  ('Hettich'),
  ('HID'),
  ('Hikvision'),
  ('Hill-Rom'),
  ('Hitachi'),
  ('Hitachi Vantara'),
  ('Hobart'),
  ('Hochiki'),
  ('Hofmann'),
  ('hOmeLabs'),
  ('Honda'),
  ('Honeywell'),
  ('Honeywell Intelligrated'),
  ('Hoover'),
  ('Horiba'),
  ('Hoshizaki'),
  ('Howden'),
  ('HP'),
  ('HP Aruba'),
  ('HP Chromebook'),
  ('HP EliteBook'),
  ('HP EliteBook Rugged'),
  ('HP EliteDesk Mini'),
  ('HP Enterprise'),
  ('HP Omen'),
  ('HP Spectre x360'),
  ('HP Z-Series'),
  ('HP ZBook'),
  ('HPE'),
  ('HPE SimpliVity'),
  ('HPE StoreOnce'),
  ('Huawei'),
  ('Huawei MatePad'),
  ('Huawei MateBook'),
  ('Hunter'),
  ('Hunter Engineering'),
  ('Hurco'),
  ('Hussmann'),
  ('Husky'),
  ('Hyster'),
  ('Hyundai'),
  ('Hyundai Elevator'),
  ('HyperDrive'),
  ('Hytrol'),
  ('IBM'),
  ('Ice-O-Matic'),
  ('ICU Medical'),
  ('IFB'),
  ('IFB Commercial'),
  ('IGEL'),
  ('IMA Group'),
  ('Imperva'),
  ('Impro'),
  ('Infoblox'),
  ('Ingenico'),
  ('Ingersoll Rand'),
  ('Inspur'),
  ('Intel'),
  ('Intel NUC'),
  ('Intralox'),
  ('Interstate'),
  ('Invacare'),
  ('IQAir'),
  ('ITT'),
  ('Jabra'),
  ('JBL'),
  ('JBL Professional'),
  ('JCB'),
  ('Jeep'),
  ('John Deere'),
  ('Joerns'),
  ('Jungheinrich'),
  ('Juniper'),
  ('Juniper Mist'),
  ('Juniper SRX'),
  ('JVC Kenwood'),
  ('KABA'),
  ('Kaeser'),
  ('Karl Storz'),
  ('KaVo'),
  ('Kawasaki'),
  ('Kemp'),
  ('Kemppi'),
  ('Kenworth'),
  ('Kensington'),
  ('Kent'),
  ('Keychron'),
  ('Kia'),
  ('Kidde'),
  ('Kingston'),
  ('Kion'),
  ('KIOSK Information Systems'),
  ('Kirloskar'),
  ('Kobelco'),
  ('Kodak Alaris'),
  ('Kohler'),
  ('Komatsu'),
  ('Kone'),
  ('Konecranes'),
  ('Konica Minolta'),
  ('KraussMaffei'),
  ('Krones'),
  ('Kruger'),
  ('KSB'),
  ('KTM'),
  ('Kubota'),
  ('KUKA'),
  ('Kyocera'),
  ('La Marzocco'),
  ('LaCie'),
  ('Land Rover'),
  ('Lantronix'),
  ('Launch'),
  ('Legrand'),
  ('Lenovo'),
  ('Lenovo Chromebook'),
  ('Lenovo Legion'),
  ('Lenovo Tab'),
  ('Lenovo ThinkCentre Tiny'),
  ('Lenovo ThinkPad'),
  ('Lenovo ThinkPad P-Series'),
  ('Lenovo ThinkStation'),
  ('Lenovo Yoga'),
  ('Lennox'),
  ('Levoit'),
  ('Leviton'),
  ('Lexmark'),
  ('LG'),
  ('LG Chem'),
  ('LG Gram'),
  ('Lian Li'),
  ('Liebert'),
  ('Liebherr'),
  ('Lincoln Electric'),
  ('Linde'),
  ('Linet'),
  ('Link-Belt'),
  ('Livpure'),
  ('Logitech'),
  ('Lucid'),
  ('Luminous'),
  ('MAN'),
  ('Mahindra'),
  ('Mahindra Powerol'),
  ('Mahle'),
  ('MakerBot'),
  ('Manitou'),
  ('Manitowoc'),
  ('Maquet'),
  ('Maruti Suzuki'),
  ('Masimo'),
  ('Massey Ferguson'),
  ('Master Lock'),
  ('Matrix'),
  ('Maytag'),
  ('Mazak'),
  ('McAfee'),
  ('McQuay'),
  ('Medtronic'),
  ('Men & Mice'),
  ('Mercedes-Benz'),
  ('Mercedes-Benz Trucks'),
  ('Merivaara'),
  ('Michelin'),
  ('Micron'),
  ('Microsoft'),
  ('Microsoft Surface'),
  ('Microsoft Surface Pro'),
  ('Microsoft Surface Studio'),
  ('Microsoft Teams Rooms'),
  ('Midea'),
  ('Midmark'),
  ('Miele'),
  ('MikroTik'),
  ('Milestone'),
  ('Miller'),
  ('Mimecast'),
  ('Mindray'),
  ('Minimax'),
  ('MinisForum'),
  ('Minuteman'),
  ('Mitel'),
  ('Mitsubishi Electric'),
  ('Molex'),
  ('Mophie'),
  ('Morita'),
  ('MRF'),
  ('MSI'),
  ('Navien'),
  ('Nautilus Hyosung'),
  ('Natus'),
  ('NCR'),
  ('NComputing'),
  ('NEC'),
  ('Nellcor'),
  ('NetApp'),
  ('Netgear'),
  ('Neusoft Medical'),
  ('New Holland'),
  ('New York Blower'),
  ('Nexans'),
  ('Nidec'),
  ('Nidek'),
  ('Nihon Kohden'),
  ('Nipro'),
  ('Nissan'),
  ('Nonin'),
  ('Noritz'),
  ('Noctua'),
  ('Nuova Simonelli'),
  ('NuTone'),
  ('Nutanix'),
  ('NVIDIA'),
  ('NVIDIA DGX'),
  ('NxStage'),
  ('NZXT'),
  ('Oasis'),
  ('Odyssey'),
  ('Okuma'),
  ('Ola Electric'),
  ('Olympus'),
  ('Omron'),
  ('Opengear'),
  ('Opticon'),
  ('Optima'),
  ('Optoma'),
  ('Oracle'),
  ('Orient'),
  ('Orthoscan'),
  ('Otis'),
  ('Overland-Tandberg'),
  ('Paharpur'),
  ('Palo Alto'),
  ('Palo Alto Prisma'),
  ('Panasonic'),
  ('Panasonic Toughbook'),
  ('Panduit'),
  ('Patriot'),
  ('PAX'),
  ('Pelco'),
  ('Pellerin Milnor'),
  ('Penguin Computing'),
  ('Pentax Medical'),
  ('Perkins'),
  ('Peterbilt'),
  ('Phanteks'),
  ('Philips'),
  ('Pirelli'),
  ('Planar'),
  ('Planmeca'),
  ('Plantronics (Poly)'),
  ('Plugable'),
  ('Polaris'),
  ('Poly'),
  ('Polycom'),
  ('PowerColor'),
  ('Pioneer'),
  ('Proofpoint'),
  ('Prusa Research'),
  ('Pure Storage'),
  ('Pureit'),
  ('Pylontech'),
  ('QNAP'),
  ('Qualcomm (ARM)'),
  ('Quantum'),
  ('Quantum DXi'),
  ('Racold'),
  ('Raritan'),
  ('Ravaglioli'),
  ('Razer'),
  ('Regal-Beloit'),
  ('Renishaw'),
  ('ResMed'),
  ('Rexnord'),
  ('Rheem'),
  ('Richard Wolf'),
  ('Ricoh'),
  ('Riello'),
  ('Rinac'),
  ('Rinnai'),
  ('Rittal'),
  ('Rivian'),
  ('Roche'),
  ('Rockford Fosgate'),
  ('Rockwell Automation'),
  ('Roomba (iRobot)'),
  ('Rotary'),
  ('Royal Enfield'),
  ('Ruckus'),
  ('Sabrent'),
  ('Samsung'),
  ('Samsung Chromebook'),
  ('Samsung Galaxy Book'),
  ('Samsung Galaxy Tab'),
  ('Samsung T-Series'),
  ('SAMSARA'),
  ('SanDisk'),
  ('SANY'),
  ('Sapphire'),
  ('Sartorius'),
  ('Satechi'),
  ('Scala'),
  ('Scania'),
  ('Schiller'),
  ('Schindler'),
  ('Schmitz u. Söhne'),
  ('Schneider Electric'),
  ('Schuler'),
  ('Schwing Stetter'),
  ('Scotsman'),
  ('SDMO'),
  ('Seasonic'),
  ('Securikey'),
  ('Seagate'),
  ('Sennheiser'),
  ('Sentry'),
  ('Server Technology'),
  ('Sharp'),
  ('Shark'),
  ('Shimadzu'),
  ('Siemens'),
  ('Siemens Healthineers'),
  ('Silver Peak'),
  ('SK Hynix'),
  ('Skytron'),
  ('SLM Solutions'),
  ('SMA'),
  ('SMART Technologies'),
  ('Smardt'),
  ('Smeg'),
  ('Smiths Medical'),
  ('Snap-on'),
  ('Snom'),
  ('Snort'),
  ('SolarEdge'),
  ('SolarWinds'),
  ('Sonalika'),
  ('SonicWall'),
  ('Sonnen'),
  ('Sonos'),
  ('Sony'),
  ('Sophos'),
  ('Sophos XG'),
  ('Spacelabs'),
  ('Spectra Logic'),
  ('Spigen'),
  ('SPX Cooling'),
  ('StarTech'),
  ('SteelSeries'),
  ('Steelseries'),
  ('STERIS'),
  ('Stratasys'),
  ('Stryker'),
  ('STULZ'),
  ('Sullair'),
  ('Sulzer'),
  ('Sumitomo Demag'),
  ('Sungrow'),
  ('Supermicro'),
  ('Suprema'),
  ('Suricata'),
  ('Suzuki'),
  ('Symbol'),
  ('Syntegon (Bosch Packaging)'),
  ('Sysmex'),
  ('Systemair'),
  ('Systec'),
  ('Tadano'),
  ('TaoTronics'),
  ('Targus'),
  ('Tata Motors'),
  ('Tata Power'),
  ('TCL'),
  ('Teletrac Navman'),
  ('Terex'),
  ('Tesla'),
  ('Tesla Powerwall'),
  ('Tetra Pak'),
  ('Texa'),
  ('Thales'),
  ('Thermo Fisher'),
  ('Thermaltake'),
  ('ThyssenKrupp Elevator'),
  ('TOA'),
  ('TomTom'),
  ('Topcon'),
  ('Toshiba'),
  ('Toyota'),
  ('TP-Link'),
  ('TP-Link Omada'),
  ('Trane'),
  ('Trend Micro'),
  ('Trimble'),
  ('Tripp Lite'),
  ('True'),
  ('Trumpf Medical'),
  ('Turbo Air'),
  ('Tuttnauer'),
  ('TVS'),
  ('Twin City Fan'),
  ('Tyco (Johnson Controls)'),
  ('Ubiquiti'),
  ('Ugreen'),
  ('Ultimaker'),
  ('Universal Robots'),
  ('Usha'),
  ('Utimaco'),
  ('V-Guard'),
  ('Varta'),
  ('Venus'),
  ('Verifone'),
  ('Veritas'),
  ('Verizon Connect'),
  ('Vertiv'),
  ('Vertiv Avocent'),
  ('Vicks'),
  ('Victaulic'),
  ('Victoria Arduino'),
  ('ViewSonic'),
  ('Viewsonic'),
  ('Viking'),
  ('Vivotek'),
  ('VMware VeloCloud'),
  ('VMware vSAN'),
  ('Volkswagen'),
  ('Voltas'),
  ('Volvo'),
  ('Volvo CE'),
  ('Volvo Penta'),
  ('Volvo Trucks'),
  ('Vremi'),
  ('WEG'),
  ('Waterlogic'),
  ('Welch Allyn'),
  ('Western Digital'),
  ('Whirlpool'),
  ('Wilo'),
  ('Wincor Nixdorf'),
  ('WMF'),
  ('XCMG'),
  ('Xerox'),
  ('Xylem'),
  ('Yale'),
  ('Yamaha'),
  ('Yanmar'),
  ('Yaskawa'),
  ('Yealink'),
  ('York'),
  ('Yutong'),
  ('Zebra'),
  ('ZeroB'),
  ('Ziehm Imaging'),
  ('ZKTeco'),
  ('Zoomlion'),
  ('Zoom'),
  ('Zotac'),
  ('10ZiG'),
  ('Microtek')
ON CONFLICT (name) DO NOTHING;

-- 7. Insert products and product-brand mappings
-- Helper: use a DO block to insert products + mappings via category/product/brand names

DO $$
DECLARE
  v_cat_id integer;
  v_prod_id integer;
  v_brand_id integer;
BEGIN
  -- ========================
  -- HVAC & Appliances
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'HVAC & Appliances';

  -- Split Air Conditioner
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Split Air Conditioner') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Split Air Conditioner'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Daikin','LG','Carrier','Trane','Voltas','Blue Star','Hitachi','Mitsubishi Electric','Panasonic','Samsung','Whirlpool','Haier','Gree','Midea') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Cassette AC
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Cassette AC') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Cassette AC'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Daikin','Carrier','LG','Mitsubishi Electric','Trane','York','Hitachi','Fujitsu') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Central AC / Chiller
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Central AC / Chiller') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Central AC / Chiller'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Carrier','Trane','York','Lennox','Daikin','Goodman','Rheem','American Standard') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Heat Pump
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Heat Pump') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Heat Pump'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Trane','Carrier','Lennox','Daikin','Bosch','Bryant','Goodman','Mitsubishi Electric') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Air Handling Unit (AHU)
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Air Handling Unit (AHU)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Air Handling Unit (AHU)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Carrier','Trane','York','Daikin','Lennox','McQuay','Dunham-Bush') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Refrigerator
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Refrigerator') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Refrigerator'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Samsung','LG','Whirlpool','Bosch','Haier','Electrolux','GE','Siemens','Panasonic','Hitachi','Godrej') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Washing Machine
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Washing Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Washing Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Whirlpool','Samsung','LG','Bosch','IFB','Siemens','Electrolux','Miele','Haier','Panasonic') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Dryer
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Dryer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Dryer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Whirlpool','Samsung','LG','Bosch','Electrolux','Maytag','GE','Miele') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Dishwasher
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Dishwasher') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Dishwasher'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Bosch','Siemens','Miele','Whirlpool','Samsung','LG','Electrolux','Smeg') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Microwave Oven
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Microwave Oven') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Microwave Oven'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('LG','Samsung','Panasonic','Whirlpool','IFB','Bosch','Siemens','Toshiba') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Built-in Oven
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Built-in Oven') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Built-in Oven'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Bosch','Siemens','Miele','Whirlpool','Electrolux','Samsung','LG','Smeg','AEG') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Water Heater (Storage)
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Water Heater (Storage)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Water Heater (Storage)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('A.O. Smith','Rheem','Racold','Havells','Bajaj','Venus','Crompton','Haier') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Tankless Water Heater
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Tankless Water Heater') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Tankless Water Heater'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Rheem','Rinnai','Bosch','A.O. Smith','Noritz','Navien','EcoSmart') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Air Purifier
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Air Purifier') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Air Purifier'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dyson','Honeywell','Philips','IQAir','Blueair','Coway','Sharp','Panasonic','Samsung') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Dehumidifier
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Dehumidifier') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Dehumidifier'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Honeywell','Frigidaire','LG','hOmeLabs','Vremi','Midea','Aprilaire') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Humidifier
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Humidifier') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Humidifier'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Honeywell','Dyson','Levoit','Crane','Vicks','TaoTronics','Aprilaire') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Ceiling Fan
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Ceiling Fan') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Ceiling Fan'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Hunter','Havells','Crompton','Orient','Bajaj','Usha','Panasonic','Big Ass Fans') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Exhaust Fan
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Exhaust Fan') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Exhaust Fan'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Panasonic','Crompton','Havells','Orient','Usha','Broan','NuTone') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Commercial Refrigerator
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Commercial Refrigerator') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Commercial Refrigerator'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('True','Beverage-Air','Turbo Air','Manitowoc','Hoshizaki','Hussmann') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Ice Machine
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Ice Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Ice Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Hoshizaki','Manitowoc','Scotsman','Ice-O-Matic','Follett','Cornelius') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Vacuum Cleaner
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Vacuum Cleaner') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Vacuum Cleaner'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dyson','Roomba (iRobot)','Miele','Shark','Bissell','Eureka Forbes','Hoover','Bosch') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Water Purifier / RO
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Water Purifier / RO') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Water Purifier / RO'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Kent','Aquaguard','Pureit','A.O. Smith','Livpure','Blue Star','ZeroB') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- VRF / VRV System
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'VRF / VRV System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'VRF / VRV System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Daikin','Mitsubishi Electric','LG','Panasonic','Blue Star','Toshiba','Hitachi','Carrier') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Cold Room / Walk-in Freezer
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Cold Room / Walk-in Freezer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Cold Room / Walk-in Freezer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Blue Star','Rinac','Danfoss','Emerson','Bitzer','Carrier','Voltas') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Commercial Espresso Machine
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Commercial Espresso Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Commercial Espresso Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('La Marzocco','Nuova Simonelli','Victoria Arduino','Breville','Faema','WMF','Astoria') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Water Cooler / Dispenser
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Water Cooler / Dispenser') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Water Cooler / Dispenser'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Blue Star','Voltas','Usha','Oasis','Culligan','Waterlogic') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Electronics & IT
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Electronics & IT';

  -- Server
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Server') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Server'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell EMC','HP Enterprise','IBM','Lenovo','Cisco','Supermicro','Huawei','Fujitsu') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Network Switch
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Network Switch') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Network Switch'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco','Juniper','HP Aruba','Netgear','D-Link','TP-Link','Ubiquiti','Extreme Networks') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Router
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Router') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Router'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco','Juniper','Netgear','TP-Link','Asus','D-Link','Ubiquiti','MikroTik') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Firewall
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Firewall') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Firewall'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco','Palo Alto','Fortinet','Check Point','Juniper','SonicWall','Sophos') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- UPS System
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'UPS System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'UPS System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('APC','Eaton','Vertiv','CyberPower','Minuteman','Tripp Lite','Riello') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- CCTV Camera
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'CCTV Camera') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'CCTV Camera'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Hikvision','Dahua','Bosch','Axis','Hanwha','Honeywell','Pelco','Vivotek') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- NVR / DVR
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'NVR / DVR') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'NVR / DVR'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Hikvision','Dahua','Milestone','Genetec','Axis','Hanwha','Bosch') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Projector
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Projector') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Projector'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Epson','BenQ','Sony','Panasonic','NEC','Viewsonic','Optoma','Barco') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Interactive Display / Smart Board
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Interactive Display / Smart Board') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Interactive Display / Smart Board'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Samsung','LG','Cisco','Crestron','BenQ','ViewSonic','SMART Technologies') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Printer
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Printer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Printer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('HP','Canon','Epson','Brother','Xerox','Lexmark','Ricoh','Konica Minolta') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Photocopier / MFP
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Photocopier / MFP') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Photocopier / MFP'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Xerox','Canon','Ricoh','Konica Minolta','Kyocera','Sharp','Toshiba') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Scanner
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Scanner') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Scanner'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Epson','Canon','HP','Fujitsu','Brother','Kodak Alaris','Panasonic') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- POS Terminal
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'POS Terminal') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'POS Terminal'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Ingenico','Verifone','PAX','NCR','Zebra','HP','Epson') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Barcode Scanner
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Barcode Scanner') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Barcode Scanner'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Zebra','Honeywell','Datalogic','Cognex','Symbol','Opticon') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Access Control System
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Access Control System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Access Control System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('HID','Bosch','Honeywell','Hikvision','Dahua','Suprema','ZKTeco','ASSA ABLOY') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Biometric System
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Biometric System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Biometric System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('ZKTeco','Suprema','HID','NEC','Aware','Daon','Cogent') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- EPABX / IP-PBX
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'EPABX / IP-PBX') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'EPABX / IP-PBX'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco','Avaya','Panasonic','NEC','Mitel','Grandstream','3CX') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Video Conferencing System
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Video Conferencing System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Video Conferencing System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco','Polycom','Logitech','Zoom','Microsoft Teams Rooms','Barco','Crestron') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Solar Inverter
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Solar Inverter') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Solar Inverter'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('SMA','Fronius','ABB','Enphase','SolarEdge','Growatt','Sungrow','Delta') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Battery Storage System
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Battery Storage System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Battery Storage System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Tesla Powerwall','LG Chem','BYD','Sonnen','Enphase','SMA','Pylontech') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ATM Machine
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'ATM Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'ATM Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Diebold Nixdorf','NCR','Nautilus Hyosung','GRG Banking','Hitachi','Wincor Nixdorf') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Electronic Safe / Vault
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Electronic Safe / Vault') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Electronic Safe / Vault'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Godrej','KABA','Diebold','Securikey','Yale','Sentry','Master Lock') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Public Address (PA) System
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Public Address (PA) System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Public Address (PA) System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Bosch','Ahuja','TOA','Yamaha','Bose Professional','JBL Professional') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Video Wall
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Video Wall') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Video Wall'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Samsung','LG','Barco','NEC','Christie','Panasonic','Planar') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Hardware Security Module (HSM)
  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Hardware Security Module (HSM)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Hardware Security Module (HSM)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Thales','Entrust','Utimaco','IBM','Futurex') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- IT Appliances
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'IT Appliances';

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Network Attached Storage (NAS)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Network Attached Storage (NAS)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Synology','QNAP','Western Digital','Seagate','Netgear','Buffalo','Asustor') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Storage Area Network (SAN)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Storage Area Network (SAN)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell EMC','NetApp','HPE','IBM','Pure Storage','Hitachi Vantara','Huawei') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Rack Server') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Rack Server'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell EMC','HP Enterprise','Lenovo','IBM','Cisco UCS','Supermicro','Fujitsu','Huawei') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Blade Server') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Blade Server'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('HP Enterprise','Dell EMC','IBM','Cisco UCS','Lenovo','Fujitsu') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Tower Server') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Tower Server'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell EMC','HP Enterprise','Lenovo','IBM','Fujitsu','Supermicro') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Hyperconverged Infrastructure (HCI)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Hyperconverged Infrastructure (HCI)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Nutanix','VMware vSAN','Dell EMC VxRail','HPE SimpliVity','Cisco HyperFlex') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Network Load Balancer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Network Load Balancer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('F5 Networks','Citrix ADC','A10 Networks','Barracuda','Kemp','HAProxy') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Wireless Access Point') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Wireless Access Point'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco Meraki','Ubiquiti','HP Aruba','Ruckus','Netgear','TP-Link Omada','Juniper Mist') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Network Firewall Appliance') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Network Firewall Appliance'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Palo Alto','Cisco ASA','Fortinet FortiGate','Check Point','SonicWall','Juniper SRX','Sophos XG') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Intrusion Detection / Prevention (IDS/IPS)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Intrusion Detection / Prevention (IDS/IPS)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco','Palo Alto','Fortinet','Snort','Suricata','McAfee','Trend Micro') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Patch Panel') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Patch Panel'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Panduit','Leviton','Belden','CommScope','Legrand','Tripp Lite','Black Box') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'KVM Switch') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'KVM Switch'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Raritan','Aten','Vertiv Avocent','Tripp Lite','Black Box','Belkin') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Console Server / Terminal Server') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Console Server / Terminal Server'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Vertiv Avocent','Raritan','Lantronix','Cisco','Digi International','Opengear') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Tape Library / Backup Appliance') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Tape Library / Backup Appliance'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell EMC','HPE','IBM','Quantum','Overland-Tandberg','Spectra Logic') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Data Deduplication Appliance') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Data Deduplication Appliance'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell EMC DataDomain','HPE StoreOnce','ExaGrid','Quantum DXi','Veritas') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'DNS / DHCP / IPAM Appliance (DDI)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'DNS / DHCP / IPAM Appliance (DDI)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Infoblox','BlueCat','EfficientIP','Men & Mice','SolarWinds') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Email Security Gateway') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Email Security Gateway'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Proofpoint','Mimecast','Barracuda','Cisco IronPort','Fortinet','Sophos') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Web Application Firewall (WAF)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Web Application Firewall (WAF)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('F5','Cloudflare','Imperva','Barracuda','Fortinet','Akamai','AWS WAF') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Time & Attendance Terminal') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Time & Attendance Terminal'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('ZKTeco','HID','Suprema','Honeywell','Impro','Matrix','eSSL') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Thin Client') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Thin Client'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('HP','Dell Wyse','Lenovo','IGEL','Citrix Ready','10ZiG','NComputing') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Digital Signage Player') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Digital Signage Player'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Samsung','LG','BrightSign','NEC','Sony','Advantech','Scala') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'IP Phone / VoIP Phone') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'IP Phone / VoIP Phone'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco','Polycom','Yealink','Grandstream','Avaya','Panasonic','Snom') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Structured Cabling System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Structured Cabling System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Panduit','CommScope','Belden','Legrand','Nexans','HellermannTyton','Molex') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Fiber Optic Patch Panel') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Fiber Optic Patch Panel'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Panduit','Belden','CommScope','Corning','Leviton','Legrand','AFL') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Power Distribution Unit (PDU)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Power Distribution Unit (PDU)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('APC','Vertiv','Eaton','Raritan','Server Technology','Tripp Lite','CyberPower') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Out-of-Band Management Appliance') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Out-of-Band Management Appliance'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Opengear','Lantronix','Vertiv Avocent','Digi','Cisco','Raritan') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'SD-WAN Appliance') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'SD-WAN Appliance'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cisco Viptela','VMware VeloCloud','Fortinet','Silver Peak','Palo Alto Prisma','Barracuda') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'GPU Server / AI Inference Appliance') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'GPU Server / AI Inference Appliance'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('NVIDIA DGX','Dell EMC','HPE','Supermicro','Lenovo','Inspur','Penguin Computing') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Rack Enclosure / Cabinet') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Rack Enclosure / Cabinet'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('APC','Vertiv','Eaton','Rittal','Panduit','Legrand','Tripp Lite') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'KVM Extender') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'KVM Extender'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Aten','Raritan','Adder','Black Box','Guntermann & Drunck') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Enterprise Tape Drive') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Enterprise Tape Drive'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('IBM','HPE','Quantum','Oracle','Spectra Logic') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Server Rack Cooling System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Server Rack Cooling System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('APC (Schneider Electric)','Vertiv','Rittal','STULZ','Liebert') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Computing Devices
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Computing Devices';

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Laptop') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Laptop'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell','HP','Lenovo','Apple','Asus','Acer','Microsoft Surface','Samsung','Razer','MSI','Toshiba','Huawei MateBook','LG Gram') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Business Laptop') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Business Laptop'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell Latitude','HP EliteBook','Lenovo ThinkPad','Apple MacBook Pro','Microsoft Surface Pro','Fujitsu Lifebook','Panasonic Toughbook') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Gaming Laptop') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Gaming Laptop'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Asus ROG','MSI','Razer','Alienware (Dell)','Acer Predator','HP Omen','Lenovo Legion','Gigabyte Aorus') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Desktop Computer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Desktop Computer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell','HP','Lenovo','Apple','Acer','Asus','MSI','Alienware','Acer Aspire','Samsung') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'All-in-One (AiO) PC') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'All-in-One (AiO) PC'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Apple iMac','Dell','HP','Lenovo','Asus','Microsoft Surface Studio','Acer','Samsung') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Mini PC / Compact Desktop') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Mini PC / Compact Desktop'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Intel NUC','Apple Mac Mini','Lenovo ThinkCentre Tiny','HP EliteDesk Mini','Dell OptiPlex Micro','Asus PN Series','Beelink','MinisForum') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Workstation (Desktop)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Workstation (Desktop)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('HP Z-Series','Dell Precision','Lenovo ThinkStation','Apple Mac Pro','Asus ProArt','Fujitsu Celsius') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Mobile Workstation') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Mobile Workstation'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('HP ZBook','Dell Precision Mobile','Lenovo ThinkPad P-Series','Apple MacBook Pro','Asus ProArt Studiobook') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Chromebook') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Chromebook'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Google Pixelbook','HP Chromebook','Lenovo Chromebook','Asus Chromebook','Acer Chromebook','Samsung Chromebook','Dell Chromebook') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, '2-in-1 / Convertible Laptop') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = '2-in-1 / Convertible Laptop'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Microsoft Surface Pro','Lenovo Yoga','HP Spectre x360','Dell XPS 2-in-1','Asus ZenBook Flip','Samsung Galaxy Book') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Tablet') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Tablet'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Apple iPad','Samsung Galaxy Tab','Microsoft Surface','Lenovo Tab','Huawei MatePad','Amazon Fire','Asus ZenPad','TCL') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Rugged Laptop / Tablet') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Rugged Laptop / Tablet'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Panasonic Toughbook','Dell Latitude Rugged','HP EliteBook Rugged','Getac','Zebra','Handheld Group','Trimble') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Monitor / Display') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Monitor / Display'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell','HP','LG','Samsung','Asus','Acer','BenQ','ViewSonic','AOC','Philips','NEC','Eizo') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Keyboard') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Keyboard'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Logitech','Microsoft','Apple','Corsair','Razer','Keychron','HP','Dell','Cherry','Das Keyboard') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Mouse') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Mouse'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Logitech','Microsoft','Apple','Razer','Corsair','HP','Dell','Anker','Steelseries') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Webcam') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Webcam'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Logitech','Microsoft','Razer','Elgato','Poly','Dell','HP','Anker') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Headset / Headphones') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Headset / Headphones'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Jabra','Plantronics (Poly)','Logitech','Sony','Bose','Sennheiser','JBL','Razer','SteelSeries') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Docking Station') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Docking Station'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dell','HP','Lenovo','Belkin','Kensington','Targus','CalDigit','Anker','StarTech') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'External Hard Drive') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'External Hard Drive'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Western Digital','Seagate','Samsung','Toshiba','LaCie','SanDisk','G-Technology') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'USB Hub / Multiport Adapter') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'USB Hub / Multiport Adapter'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Anker','Belkin','CalDigit','Satechi','HyperDrive','Plugable','StarTech','Ugreen') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Portable SSD') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Portable SSD'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Samsung T-Series','Western Digital','SanDisk','Seagate','Kingston','Crucial','LaCie') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Internal SSD') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Internal SSD'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Samsung','Western Digital','Seagate','Kingston','Crucial','SK Hynix','Sabrent','Corsair') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'RAM / Memory Module') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'RAM / Memory Module'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Corsair','Kingston','Crucial','G.Skill','Samsung','SK Hynix','Micron','Patriot') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Graphics Card (GPU)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Graphics Card (GPU)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('NVIDIA','AMD','ASUS ROG','MSI','Gigabyte Aorus','Zotac','Sapphire','PowerColor') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Processor (CPU)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Processor (CPU)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Intel','AMD','Apple (M-series)','Qualcomm (ARM)') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Motherboard') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Motherboard'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Asus','MSI','Gigabyte','ASRock','Intel','Supermicro','EVGA') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Power Supply Unit (PSU)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Power Supply Unit (PSU)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Corsair','EVGA','Seasonic','be quiet!','Thermaltake','Cooler Master','Antec') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'PC Cabinet / Case') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'PC Cabinet / Case'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Corsair','NZXT','Fractal Design','Lian Li','Cooler Master','Phanteks','be quiet!','Thermaltake') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'CPU Cooler') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'CPU Cooler'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Noctua','Corsair','be quiet!','Cooler Master','NZXT','Deepcool','Thermaltake','Arctic') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Uninterruptible Power Supply (Personal UPS)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Uninterruptible Power Supply (Personal UPS)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('APC','CyberPower','Eaton','Tripp Lite','Luminous','Microtek','V-Guard') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Smart Speaker / Voice Assistant') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Smart Speaker / Voice Assistant'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Amazon Echo','Google Nest','Apple HomePod','Sonos','JBL','Bose','Harman Kardon') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Wireless Charger') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Wireless Charger'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Anker','Belkin','Samsung','Apple MagSafe','Mophie','Spigen','Ugreen') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, '3D Printer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = '3D Printer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('MakerBot','Ultimaker','Formlabs','Creality','Stratasys','Prusa Research') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Interactive Kiosk') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Interactive Kiosk'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('NCR','Diebold Nixdorf','Zebra','Elo Touch Solutions','KIOSK Information Systems') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Automotive
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Automotive';

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Passenger Car') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Passenger Car'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Toyota','Honda','Ford','Volkswagen','Hyundai','Kia','Chevrolet','BMW','Mercedes-Benz','Audi','Nissan','Maruti Suzuki','Tata Motors','Mahindra') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'SUV / Crossover') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'SUV / Crossover'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Toyota','Ford','Jeep','Land Rover','Hyundai','Kia','BMW','Mercedes-Benz','Audi','Volvo','Mahindra','Tata Motors') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Electric Vehicle (EV)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Electric Vehicle (EV)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Tesla','BYD','Rivian','Lucid','Nissan','Hyundai','Kia','BMW','Volkswagen','Tata Motors','Ola Electric') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Commercial Truck') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Commercial Truck'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Volvo Trucks','Mercedes-Benz Trucks','MAN','Scania','Kenworth','Peterbilt','Freightliner','Tata Motors','Ashok Leyland','Eicher') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Bus') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Bus'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Volvo','Mercedes-Benz','MAN','Tata Motors','Ashok Leyland','FUSO','Yutong','BYD') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Motorcycle') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Motorcycle'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Honda','Yamaha','Kawasaki','Suzuki','Harley-Davidson','Royal Enfield','Hero MotoCorp','Bajaj','TVS','KTM','Ducati') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Forklift') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Forklift'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Toyota','Crown','Hyster','Yale','Jungheinrich','Linde','Kion','Manitou','Doosan') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'EV Charging Station') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'EV Charging Station'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('ChargePoint','ABB','Siemens','Schneider Electric','Tata Power','Ather','Exicom','Delta') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Automotive Battery') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Automotive Battery'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Exide','Amara Raja (Amaron)','Bosch','Optima','Interstate','Odyssey','Varta') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Car Audio System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Car Audio System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Pioneer','Sony','JVC Kenwood','Alpine','Harman Kardon','Bose','Rockford Fosgate') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'GPS / Fleet Tracking') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'GPS / Fleet Tracking'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Trimble','Garmin','TomTom','Teletrac Navman','Verizon Connect','Geotab','SAMSARA') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Tyre') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Tyre'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Michelin','Bridgestone','Goodyear','Continental','Pirelli','Dunlop','MRF','Apollo','CEAT') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Automotive Lift / Hoist') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Automotive Lift / Hoist'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('BendPak','Rotary','Challenger','Forward Lift','Snap-on','Ravaglioli') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Vehicle Diagnostic Tool') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Vehicle Diagnostic Tool'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Bosch','Snap-on','Autel','Launch','Delphi','Mahle','Texa') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Tractor / Agricultural Machinery') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Tractor / Agricultural Machinery'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Mahindra','John Deere','Massey Ferguson','Sonalika','Escorts','New Holland','Kubota') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Golf Cart / Low Speed Vehicle') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Golf Cart / Low Speed Vehicle'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Club Car','EZ-GO','Yamaha','Polaris','Garia') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Wheel Aligner / Balancer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Wheel Aligner / Balancer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Hunter Engineering','Corghi','Hofmann','Snap-on','Bosch','CEMB') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Medical Equipment
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Medical Equipment';

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Patient Monitor') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Patient Monitor'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Philips','GE Healthcare','Mindray','Nihon Kohden','Drager','Spacelabs','Masimo') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Ventilator') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Ventilator'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Philips','Drager','GE Healthcare','Medtronic','Hamilton Medical','Maquet','ResMed') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Infusion Pump') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Infusion Pump'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Baxter','B. Braun','BD','ICU Medical','Smiths Medical','Fresenius Kabi') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Syringe Pump') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Syringe Pump'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('B. Braun','Fresenius Kabi','BD','Baxter','Mindray','Agilia') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Defibrillator (AED)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Defibrillator (AED)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Philips','Zoll','Cardiac Science','Nihon Kohden','Stryker','GE Healthcare') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'ECG Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'ECG Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('GE Healthcare','Philips','Mindray','Nihon Kohden','Schiller','Welch Allyn') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Ultrasound Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Ultrasound Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('GE Healthcare','Philips','Siemens Healthineers','Canon Medical','Mindray','Fujifilm','Esaote') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'X-Ray Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'X-Ray Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Siemens Healthineers','GE Healthcare','Philips','Canon Medical','Fujifilm','Shimadzu','Mindray') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'CT Scanner') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'CT Scanner'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Siemens Healthineers','GE Healthcare','Philips','Canon Medical','Neusoft Medical') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'MRI Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'MRI Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Siemens Healthineers','GE Healthcare','Philips','Hitachi','Esaote','Bruker') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Surgical Light') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Surgical Light'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Stryker','Philips','Maquet','Trumpf Medical','Skytron','Brandon Medical') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Operating Table') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Operating Table'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Stryker','Maquet','Trumpf Medical','Merivaara','Schmitz u. Söhne','ALVO') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Anesthesia Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Anesthesia Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Drager','GE Healthcare','Mindray','Getinge','Spacelabs') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Sterilizer / Autoclave') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Sterilizer / Autoclave'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Getinge','STERIS','Tuttnauer','Belimed','Systec','Midmark') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Dialysis Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Dialysis Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Fresenius Medical Care','Baxter','Nipro','B. Braun','NxStage') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Laboratory Centrifuge') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Laboratory Centrifuge'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Eppendorf','Thermo Fisher','Beckman Coulter','Hettich','Sartorius') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Blood Analyzer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Blood Analyzer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Sysmex','Beckman Coulter','Abbott','Mindray','Horiba') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Biochemistry Analyzer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Biochemistry Analyzer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Roche','Abbott','Siemens Healthineers','Beckman Coulter','Mindray','Erba') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Dental Chair') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Dental Chair'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dentsply Sirona','KaVo','A-dec','Planmeca','Morita','Midmark') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Ophthalmic Equipment') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Ophthalmic Equipment'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Carl Zeiss','Topcon','Nidek','Haag-Streit','Alcon','Bausch + Lomb') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Hospital Bed') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Hospital Bed'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Hill-Rom','Stryker','Linet','Invacare','ArjoHuntleigh','Joerns') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Pulse Oximeter') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Pulse Oximeter'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Masimo','Nellcor','Nonin','Philips','GE Healthcare','Contec') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Blood Pressure Monitor') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Blood Pressure Monitor'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Omron','Philips','A&D Medical','Welch Allyn','Spacelabs','GE Healthcare') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Endoscopy System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Endoscopy System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Olympus','Karl Storz','Stryker','Fujifilm','Pentax Medical','Richard Wolf') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Neonatal Incubator') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Neonatal Incubator'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Drager','GE Healthcare','Atom Medical','Natus','Fanem') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'C-Arm Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'C-Arm Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Siemens Healthineers','GE Healthcare','Philips','Ziehm Imaging','Orthoscan') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Lithotripter') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Lithotripter'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dornier MedTech','Richard Wolf','Siemens Healthineers','DirexGroup','EDAP TMS') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ========================
  -- Industrial & Heavy Machinery
  -- ========================
  SELECT id INTO v_cat_id FROM public.catalog_categories WHERE name = 'Industrial & Heavy Machinery';

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Air Compressor') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Air Compressor'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Atlas Copco','Ingersoll Rand','Kaeser','Sullair','Gardner Denver','CompAir','Elgi','Kirloskar') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Industrial Generator') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial Generator'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cummins','Caterpillar','Kohler','Perkins','Volvo Penta','Kirloskar','Mahindra Powerol','SDMO') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Industrial Pump') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial Pump'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Grundfos','Xylem','Flowserve','Sulzer','ITT','Wilo','Kirloskar','KSB') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Industrial Boiler') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial Boiler'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Thermax','Cleaver-Brooks','Miura','Forbes Marshall','Babcock & Wilcox','Aalborg') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Chiller (Industrial)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Chiller (Industrial)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Carrier','Trane','York','Daikin','Mitsubishi Electric','Smardt','LG') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Cooling Tower') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Cooling Tower'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('SPX Cooling','Evapco','Baltimore Aircoil','Brentwood','Paharpur','Thermax') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Industrial Fan / Blower') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial Fan / Blower'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Twin City Fan','New York Blower','Howden','Kruger','Systemair') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Conveyor System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Conveyor System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Dorner','Hytrol','Intralox','Rexnord','Daifuku','Dematic','Honeywell Intelligrated') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Overhead Crane') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Overhead Crane'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Konecranes','Demag','Manitowoc','Liebherr','ABUS','GH Cranes','Terex') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Hydraulic Press') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Hydraulic Press'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Schuler','Komatsu','Aida','Bliss Industries','Beckwood','Greenerd') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'CNC Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'CNC Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Haas','Fanuc','Mazak','DMG Mori','Okuma','Hurco','Doosan','Brother') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Industrial Robot') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial Robot'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('KUKA','ABB','Fanuc','Yaskawa','Kawasaki','Mitsubishi Electric','Universal Robots','Stäubli') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Welding Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Welding Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Lincoln Electric','Miller','ESAB','Fronius','Hobart','Bosch','Kemppi') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Diesel Engine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Diesel Engine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Cummins','Caterpillar','Perkins','John Deere','Deutz','Volvo Penta','Yanmar') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Transformer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Transformer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('ABB','Siemens','Eaton','Schneider Electric','GE','Crompton Greaves','BHEL') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Motor (Electric)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Motor (Electric)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Siemens','ABB','GE','WEG','Nidec','Regal-Beloit','Crompton Greaves','Kirloskar') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Variable Frequency Drive (VFD)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Variable Frequency Drive (VFD)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('ABB','Siemens','Schneider Electric','Danfoss','Yaskawa','Rockwell Automation','Delta','Fuji Electric') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'PLC') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'PLC'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Siemens','Rockwell Automation','ABB','Schneider Electric','Mitsubishi Electric','Omron','GE','Beckhoff') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Excavator') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Excavator'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Caterpillar','Komatsu','Hitachi','Liebherr','Volvo CE','Hyundai','JCB','Doosan') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Bulldozer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Bulldozer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Caterpillar','Komatsu','John Deere','Liebherr','Case CE','XCMG') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Crane (Mobile)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Crane (Mobile)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Liebherr','Manitowoc','Terex','Tadano','Grove','Kobelco','Link-Belt') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Concrete Mixer') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Concrete Mixer'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Schwing Stetter','Liebherr','Elkon','SANY','XCMG','Zoomlion') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Fire Suppression System') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Fire Suppression System'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Tyco (Johnson Controls)','Victaulic','Viking','Kidde','Ansul','Minimax','Hochiki') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Elevator / Escalator') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Elevator / Escalator'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Otis','Schindler','Kone','ThyssenKrupp Elevator','Fujitec','Mitsubishi Electric','Hyundai Elevator') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Injection Molding Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Injection Molding Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Engel','KraussMaffei','Arburg','Husky','Sumitomo Demag','Haitian') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Commercial Laundry Equipment') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Commercial Laundry Equipment'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Alliance Laundry Systems','Girbau','Electrolux Professional','Dexter Laundry','Pellerin Milnor','IFB Commercial') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Packaging Machine') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Packaging Machine'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Tetra Pak','Krones','Syntegon (Bosch Packaging)','Coesia','IMA Group') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO public.catalog_products (category_id, name) VALUES (v_cat_id, 'Industrial 3D Printer (Additive Mfg)') ON CONFLICT (category_id, name) DO NOTHING RETURNING id INTO v_prod_id;
  IF v_prod_id IS NULL THEN SELECT id INTO v_prod_id FROM public.catalog_products WHERE category_id = v_cat_id AND name = 'Industrial 3D Printer (Additive Mfg)'; END IF;
  FOR v_brand_id IN SELECT id FROM public.catalog_brands WHERE name IN ('Stratasys','3D Systems','EOS','SLM Solutions','Renishaw','Desktop Metal') LOOP
    INSERT INTO public.catalog_product_brands (product_id, brand_id) VALUES (v_prod_id, v_brand_id) ON CONFLICT DO NOTHING;
  END LOOP;

END $$;

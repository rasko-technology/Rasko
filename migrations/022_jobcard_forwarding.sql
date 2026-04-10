-- Add 'forwarded' to jobcard_status enum
ALTER TYPE jobcard_status ADD VALUE IF NOT EXISTS 'forwarded';

-- Add forwarding columns to jobcards
ALTER TABLE jobcards
  ADD COLUMN IF NOT EXISTS forwarded_to_store_id bigint REFERENCES stores(id),
  ADD COLUMN IF NOT EXISTS forwarded_to_store_name text,
  ADD COLUMN IF NOT EXISTS forwarded_to_store_address text,
  ADD COLUMN IF NOT EXISTS forwarded_to_store_phone text,
  ADD COLUMN IF NOT EXISTS forwarded_from_jobcard_id bigint REFERENCES jobcards(id),
  ADD COLUMN IF NOT EXISTS forwarded_from_store_name text;

-- SECURITY DEFINER function to forward jobcard (bypasses RLS for cross-store insert)
CREATE OR REPLACE FUNCTION forward_jobcard(
  p_jobcard_id bigint,
  p_source_store_id bigint,
  p_target_store_id bigint DEFAULT NULL,
  p_target_store_name text DEFAULT NULL,
  p_target_store_address text DEFAULT NULL,
  p_target_store_phone text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_jobcard jobcards%ROWTYPE;
  v_source_store_name text;
  v_new_jobcard_id bigint;
BEGIN
  SELECT * INTO v_source_jobcard
  FROM jobcards
  WHERE id = p_jobcard_id AND store_id = p_source_store_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Job card not found or access denied');
  END IF;

  IF v_source_jobcard.status = 'forwarded' THEN
    RETURN jsonb_build_object('error', 'This job card has already been forwarded');
  END IF;

  SELECT name INTO v_source_store_name FROM stores WHERE id = p_source_store_id;

  IF p_target_store_id IS NOT NULL THEN
    INSERT INTO jobcards (
      store_id, customer_name, phone, address, carrier_name, carrier_phone,
      payment_type, incoming_source, priority, product_name, brand, model_name,
      serial_numbers, device_password, estimation_amount, advance_amount,
      accessories_received, default_issues, additional_requirements,
      notes, purchase_date, courier_name, courier_date, doc_number,
      customer_id, images, booking_date_time, inspection_charges,
      forwarded_from_jobcard_id, forwarded_from_store_name, status
    ) VALUES (
      p_target_store_id, v_source_jobcard.customer_name, v_source_jobcard.phone,
      v_source_jobcard.address, v_source_jobcard.carrier_name, v_source_jobcard.carrier_phone,
      v_source_jobcard.payment_type, v_source_jobcard.incoming_source, v_source_jobcard.priority,
      v_source_jobcard.product_name, v_source_jobcard.brand, v_source_jobcard.model_name,
      v_source_jobcard.serial_numbers, v_source_jobcard.device_password,
      v_source_jobcard.estimation_amount, v_source_jobcard.advance_amount,
      v_source_jobcard.accessories_received, v_source_jobcard.default_issues,
      v_source_jobcard.additional_requirements,
      v_source_jobcard.notes, v_source_jobcard.purchase_date,
      v_source_jobcard.courier_name, v_source_jobcard.courier_date,
      v_source_jobcard.doc_number, v_source_jobcard.customer_id,
      v_source_jobcard.images, now(), v_source_jobcard.inspection_charges,
      p_jobcard_id, v_source_store_name, 'open'::jobcard_status
    ) RETURNING id INTO v_new_jobcard_id;
  END IF;

  UPDATE jobcards SET
    status = 'forwarded',
    forwarded_to_store_id = p_target_store_id,
    forwarded_to_store_name = p_target_store_name,
    forwarded_to_store_address = p_target_store_address,
    forwarded_to_store_phone = p_target_store_phone,
    updated_at = now()
  WHERE id = p_jobcard_id AND store_id = p_source_store_id;

  RETURN jsonb_build_object(
    'success', true,
    'forwarded_jobcard_id', v_new_jobcard_id,
    'target_store_name', p_target_store_name
  );
END;
$$;

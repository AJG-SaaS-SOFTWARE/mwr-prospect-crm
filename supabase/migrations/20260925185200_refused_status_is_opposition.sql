CREATE OR REPLACE FUNCTION public.prospect_contact_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.do_not_contact AND (NOT NEW.do_not_contact OR NEW.status <> 'refused') THEN
    RAISE EXCEPTION 'Contact opposition cannot be removed by this workflow';
  END IF;
  IF NEW.status = 'refused' THEN NEW.do_not_contact := true; END IF;
  IF NEW.do_not_contact THEN NEW.status := 'refused'; NEW.next_follow_up_at := NULL; END IF;
  IF NEW.owner_id IS DISTINCT FROM auth.uid() AND auth.role() <> 'service_role' THEN RAISE EXCEPTION 'Owner mismatch'; END IF;
  IF NEW.external_identifier IS NOT NULL AND NEW.external_identifier <> '' AND EXISTS (
    SELECT 1 FROM public.do_not_contact d WHERE d.owner_id = NEW.owner_id AND d.channel = NEW.channel AND lower(d.external_identifier) = lower(NEW.external_identifier)
  ) THEN NEW.do_not_contact := true; NEW.status := 'refused'; NEW.next_follow_up_at := NULL; END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.block_dnc_followup() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF NEW.status='pending' AND EXISTS(SELECT 1 FROM public.prospects p WHERE p.id=NEW.prospect_id AND p.do_not_contact) THEN
  RAISE EXCEPTION 'Prospect is on do-not-contact list';
 END IF;
 RETURN NEW;
END $$;

-- Keep contact preferences enforceable across UI, REST and future channel integrations.
ALTER TABLE public.do_not_contact DROP CONSTRAINT IF EXISTS do_not_contact_channel_external_identifier_key;
CREATE UNIQUE INDEX IF NOT EXISTS do_not_contact_owner_channel_identifier_key ON public.do_not_contact(owner_id,channel,external_identifier);

CREATE OR REPLACE FUNCTION public.prospect_contact_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.do_not_contact AND (NOT NEW.do_not_contact OR NEW.status <> 'refused') THEN
    RAISE EXCEPTION 'Contact opposition cannot be removed by this workflow';
  END IF;
  IF NEW.do_not_contact THEN
    NEW.status := 'refused';
    NEW.next_follow_up_at := NULL;
  END IF;
  IF NEW.owner_id IS DISTINCT FROM auth.uid() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Owner mismatch';
  END IF;
  IF NEW.external_identifier IS NOT NULL AND NEW.external_identifier <> '' AND EXISTS (
    SELECT 1 FROM public.do_not_contact d WHERE d.owner_id = NEW.owner_id AND d.channel = NEW.channel AND lower(d.external_identifier) = lower(NEW.external_identifier)
  ) THEN
    NEW.do_not_contact := true;
    NEW.status := 'refused';
    NEW.next_follow_up_at := NULL;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS prospect_contact_guard ON public.prospects;
CREATE TRIGGER prospect_contact_guard BEFORE INSERT OR UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.prospect_contact_guard();

CREATE OR REPLACE FUNCTION public.related_owner_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE actual_owner uuid; blocked boolean;
BEGIN
  IF TG_TABLE_NAME = 'messages' THEN
    SELECT p.owner_id,p.do_not_contact INTO actual_owner,blocked FROM public.conversations c JOIN public.prospects p ON p.id=c.prospect_id WHERE c.id=NEW.conversation_id;
    IF NEW.direction='outbound' AND blocked THEN RAISE EXCEPTION 'Prospect opted out'; END IF;
  ELSE
    SELECT p.owner_id,p.do_not_contact INTO actual_owner,blocked FROM public.prospects p WHERE p.id=NEW.prospect_id;
    IF TG_TABLE_NAME = 'follow_ups' AND blocked AND NEW.status='pending' THEN RAISE EXCEPTION 'Prospect opted out'; END IF;
    IF TG_TABLE_NAME = 'presentations' AND blocked AND NEW.status IN ('proposed','booked') THEN RAISE EXCEPTION 'Prospect opted out'; END IF;
  END IF;
  IF actual_owner IS NULL OR NEW.owner_id IS DISTINCT FROM actual_owner THEN RAISE EXCEPTION 'Related record owner mismatch'; END IF;
  RETURN NEW;
END; $$;
DO $$ DECLARE table_name text; BEGIN
  FOREACH table_name IN ARRAY ARRAY['conversations','messages','follow_ups','presentations'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS related_owner_guard ON public.%I',table_name);
    EXECUTE format('CREATE TRIGGER related_owner_guard BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.related_owner_guard()',table_name);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.cancel_contact_tasks() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.do_not_contact AND NOT OLD.do_not_contact THEN
   UPDATE public.follow_ups SET status='cancelled' WHERE prospect_id=NEW.id AND status='pending';
   UPDATE public.presentations SET status='cancelled' WHERE prospect_id=NEW.id AND status IN ('proposed','booked');
 END IF;
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS cancel_contact_tasks ON public.prospects;
CREATE TRIGGER cancel_contact_tasks AFTER UPDATE OF do_not_contact ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.cancel_contact_tasks();

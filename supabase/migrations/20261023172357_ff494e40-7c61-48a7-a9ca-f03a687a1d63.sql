CREATE OR REPLACE FUNCTION public.guard_report_update() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT public.is_admin() AND (to_jsonb(new) - 'reply_seen_by_student' - 'updated_at') IS DISTINCT FROM (to_jsonb(old) - 'reply_seen_by_student' - 'updated_at') THEN
  RAISE EXCEPTION 'শুধু উত্তর পড়া হয়েছে হিসেবে পরিবর্তন করা যাবে';
 END IF;
 RETURN new;
END $$;
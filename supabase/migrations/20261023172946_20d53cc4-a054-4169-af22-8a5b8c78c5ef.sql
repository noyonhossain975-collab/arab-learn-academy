CREATE OR REPLACE FUNCTION public.complete_lesson(p_lesson_id uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); added integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'প্রথমে লগইন করুন'; END IF;
 IF NOT public.can_access_lesson(uid,p_lesson_id) THEN RAISE EXCEPTION 'এই পাঠের প্রবেশাধিকার নেই'; END IF;
 INSERT INTO public.lesson_progress(user_id,lesson_id) VALUES(uid,p_lesson_id) ON CONFLICT(user_id,lesson_id) DO NOTHING;
 GET DIAGNOSTICS added=ROW_COUNT;
 IF added=1 THEN
  INSERT INTO public.daily_activity(user_id,activity_date,lessons_completed) VALUES(uid,public.dhaka_today(),1)
  ON CONFLICT(user_id,activity_date) DO UPDATE SET lessons_completed=public.daily_activity.lessons_completed+1;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.complete_lesson(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.complete_lesson(uuid) TO authenticated;
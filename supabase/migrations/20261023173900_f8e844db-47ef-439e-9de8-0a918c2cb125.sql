CREATE UNIQUE INDEX IF NOT EXISTS saved_mistakes_user_question_uidx ON public.saved_mistakes(user_id, question_id);
CREATE UNIQUE INDEX IF NOT EXISTS attempt_answers_unique_idx ON public.attempt_answers(attempt_id, question_id, COALESCE(part_id,'00000000-0000-0000-0000-000000000000'::uuid));

CREATE OR REPLACE FUNCTION public.start_exam(p_folder_id uuid) RETURNS uuid LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE uid uuid := auth.uid(); t integer; aid uuid;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'প্রথমে লগইন করুন'; END IF;
 IF NOT public.can_access_folder(uid,p_folder_id) THEN RAISE EXCEPTION 'এই পরীক্ষার প্রবেশাধিকার নেই'; END IF;
 SELECT COALESCE(SUM(CASE WHEN q.type='mcq' THEN 1 ELSE (SELECT COALESCE(SUM(cp.marks),0) FROM public.creative_parts cp WHERE cp.question_id=q.id) END),0)
  INTO t FROM public.questions q WHERE q.folder_id=p_folder_id;
 IF t=0 THEN RAISE EXCEPTION 'এই অংশে কোনো প্রশ্ন নেই'; END IF;
 INSERT INTO public.exam_attempts(user_id,folder_id,score,total) VALUES(uid,p_folder_id,0,t) RETURNING id INTO aid;
 RETURN aid;
END $$;

CREATE OR REPLACE FUNCTION public._grade(p_question_id uuid, p_option_id uuid, p_part_id uuid, p_self_correct boolean, OUT ok boolean, OUT marks integer)
LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE qt text;
BEGIN
 SELECT type INTO qt FROM public.questions WHERE id=p_question_id;
 IF qt IS NULL THEN RAISE EXCEPTION 'প্রশ্ন পাওয়া যায়নি'; END IF;
 IF qt='mcq' THEN
  SELECT o.is_correct INTO ok FROM public.question_options o WHERE o.id=p_option_id AND o.question_id=p_question_id;
  IF ok IS NULL THEN RAISE EXCEPTION 'অপশন সঠিক নয়'; END IF; marks:=1;
 ELSE
  SELECT cp.marks INTO marks FROM public.creative_parts cp WHERE cp.id=p_part_id AND cp.question_id=p_question_id;
  IF marks IS NULL THEN RAISE EXCEPTION 'অংশ পাওয়া যায়নি'; END IF; ok:=COALESCE(p_self_correct,false);
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public._track(uid uuid, p_question_id uuid, ok boolean, pts integer, practice boolean) RETURNS void
LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
 INSERT INTO public.daily_activity(user_id,activity_date,questions_answered,points) VALUES(uid,public.dhaka_today(),1,CASE WHEN ok THEN pts ELSE 0 END)
  ON CONFLICT(user_id,activity_date) DO UPDATE SET questions_answered=public.daily_activity.questions_answered+1, points=public.daily_activity.points+EXCLUDED.points;
 IF NOT ok THEN
  INSERT INTO public.saved_mistakes(user_id,question_id,times_wrong,is_resolved,last_wrong_at) VALUES(uid,p_question_id,1,false,now())
   ON CONFLICT(user_id,question_id) DO UPDATE SET times_wrong=public.saved_mistakes.times_wrong+1,is_resolved=false,resolved_at=NULL,last_wrong_at=now();
 ELSIF practice THEN
  UPDATE public.saved_mistakes SET is_resolved=true,resolved_at=now() WHERE user_id=uid AND question_id=p_question_id;
 END IF;
END $$;

CREATE OR REPLACE FUNCTION public.answer_question(p_attempt_id uuid, p_question_id uuid, p_option_id uuid DEFAULT NULL, p_part_id uuid DEFAULT NULL, p_self_correct boolean DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE uid uuid := auth.uid(); a public.exam_attempts; g record; prev boolean;
BEGIN
 SELECT * INTO a FROM public.exam_attempts WHERE id=p_attempt_id AND user_id=uid;
 IF a.id IS NULL THEN RAISE EXCEPTION 'পরীক্ষা পাওয়া যায়নি'; END IF;
 IF a.finished_at IS NOT NULL THEN RAISE EXCEPTION 'পরীক্ষা শেষ হয়ে গেছে'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.questions WHERE id=p_question_id AND folder_id=a.folder_id) OR NOT public.can_access_folder(uid,a.folder_id) THEN RAISE EXCEPTION 'প্রশ্নটি এই পরীক্ষার নয়'; END IF;
 SELECT is_correct INTO prev FROM public.attempt_answers WHERE attempt_id=a.id AND question_id=p_question_id AND part_id IS NOT DISTINCT FROM p_part_id;
 IF prev IS NOT NULL THEN RETURN prev; END IF;
 SELECT * INTO g FROM public._grade(p_question_id,p_option_id,p_part_id,p_self_correct);
 INSERT INTO public.attempt_answers(attempt_id,question_id,part_id,selected_option_id,is_correct) VALUES(a.id,p_question_id,p_part_id,p_option_id,g.ok);
 IF g.ok THEN UPDATE public.exam_attempts SET score=score+g.marks WHERE id=a.id; END IF;
 PERFORM public._track(uid,p_question_id,g.ok,g.marks,false);
 RETURN g.ok;
END $$;

CREATE OR REPLACE FUNCTION public.finish_exam(p_attempt_id uuid) RETURNS void LANGUAGE sql SET search_path TO 'public' AS $$
 UPDATE public.exam_attempts SET finished_at=COALESCE(finished_at,now()) WHERE id=p_attempt_id AND user_id=auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.practice_mistake(p_question_id uuid, p_option_id uuid DEFAULT NULL, p_part_id uuid DEFAULT NULL, p_self_correct boolean DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE uid uuid := auth.uid(); g record; f uuid;
BEGIN
 SELECT folder_id INTO f FROM public.questions WHERE id=p_question_id;
 IF uid IS NULL OR f IS NULL OR NOT public.can_access_folder(uid,f) THEN RAISE EXCEPTION 'প্রবেশাধিকার নেই'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.saved_mistakes WHERE user_id=uid AND question_id=p_question_id) THEN RAISE EXCEPTION 'ভুলের তালিকায় নেই'; END IF;
 SELECT * INTO g FROM public._grade(p_question_id,p_option_id,p_part_id,p_self_correct);
 PERFORM public._track(uid,p_question_id,g.ok,0,true);
 RETURN g.ok;
END $$;

REVOKE ALL ON FUNCTION public._grade(uuid,uuid,uuid,boolean), public._track(uuid,uuid,boolean,integer,boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.start_exam(uuid), public.answer_question(uuid,uuid,uuid,uuid,boolean), public.finish_exam(uuid), public.practice_mistake(uuid,uuid,uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_exam(uuid), public.answer_question(uuid,uuid,uuid,uuid,boolean), public.finish_exam(uuid), public.practice_mistake(uuid,uuid,uuid,boolean) TO authenticated;
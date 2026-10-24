ALTER TABLE public.exam_attempts ADD COLUMN question_ids uuid[];

CREATE FUNCTION public.start_exam(p_folder_id uuid, p_question_ids uuid[]) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE uid uuid := auth.uid(); t integer; aid uuid; n integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'প্রথমে লগইন করুন'; END IF;
 IF NOT public.can_access_folder(uid,p_folder_id) THEN RAISE EXCEPTION 'এই পরীক্ষার প্রবেশাধিকার নেই'; END IF;
 n := cardinality(p_question_ids);
 IF n IS NULL OR n < 1 THEN RAISE EXCEPTION 'অন্তত একটি প্রশ্ন বেছে নিন'; END IF;
 IF (SELECT count(DISTINCT x) FROM unnest(p_question_ids) x) <> n OR (SELECT count(*) FROM public.questions WHERE folder_id=p_folder_id AND id=ANY(p_question_ids)) <> n THEN RAISE EXCEPTION 'নির্বাচিত প্রশ্নগুলো এই পরীক্ষার নয়'; END IF;
 SELECT COALESCE(SUM(CASE WHEN q.type='mcq' THEN 1 ELSE (SELECT COALESCE(SUM(cp.marks),0) FROM public.creative_parts cp WHERE cp.question_id=q.id) END),0) INTO t FROM public.questions q WHERE q.folder_id=p_folder_id AND q.id=ANY(p_question_ids);
 IF t=0 THEN RAISE EXCEPTION 'এই অংশে কোনো প্রশ্ন নেই'; END IF;
 INSERT INTO public.exam_attempts(user_id,folder_id,score,total,question_ids) VALUES(uid,p_folder_id,0,t,p_question_ids) RETURNING id INTO aid;
 RETURN aid;
END $$;
REVOKE ALL ON FUNCTION public.start_exam(uuid,uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_exam(uuid,uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.answer_question(p_attempt_id uuid, p_question_id uuid, p_option_id uuid DEFAULT NULL, p_part_id uuid DEFAULT NULL, p_self_correct boolean DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE uid uuid := auth.uid(); a public.exam_attempts; g record; prev boolean;
BEGIN
 SELECT * INTO a FROM public.exam_attempts WHERE id=p_attempt_id AND user_id=uid FOR UPDATE;
 IF a.id IS NULL THEN RAISE EXCEPTION 'পরীক্ষা পাওয়া যায়নি'; END IF;
 IF a.finished_at IS NOT NULL THEN RAISE EXCEPTION 'পরীক্ষা শেষ হয়ে গেছে'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.questions WHERE id=p_question_id AND folder_id=a.folder_id) OR NOT public.can_access_folder(uid,a.folder_id) OR (a.question_ids IS NOT NULL AND NOT (p_question_id=ANY(a.question_ids))) THEN RAISE EXCEPTION 'প্রশ্নটি এই পরীক্ষার নয়'; END IF;
 SELECT is_correct INTO prev FROM public.attempt_answers WHERE attempt_id=a.id AND question_id=p_question_id AND part_id IS NOT DISTINCT FROM p_part_id;
 IF prev IS NOT NULL THEN RETURN prev; END IF;
 SELECT * INTO g FROM public._grade(p_question_id,p_option_id,p_part_id,p_self_correct);
 INSERT INTO public.attempt_answers(attempt_id,question_id,part_id,selected_option_id,is_correct) VALUES(a.id,p_question_id,p_part_id,p_option_id,g.ok);
 IF g.ok THEN UPDATE public.exam_attempts SET score=score+g.marks WHERE id=a.id; END IF;
 PERFORM public._track(uid,p_question_id,g.ok,g.marks,false);
 RETURN g.ok;
END $$;
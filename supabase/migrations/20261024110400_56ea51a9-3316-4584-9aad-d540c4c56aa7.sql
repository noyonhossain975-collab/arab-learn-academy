DROP POLICY "Own attempts" ON public.exam_attempts;
CREATE POLICY "Own attempts" ON public.exam_attempts FOR SELECT TO authenticated USING (user_id=auth.uid());
DROP POLICY "Own attempt answers" ON public.attempt_answers;
CREATE POLICY "Own attempt answers" ON public.attempt_answers FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.exam_attempts a WHERE a.id=attempt_answers.attempt_id AND a.user_id=auth.uid()));
CREATE OR REPLACE FUNCTION public.finish_exam(p_attempt_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE a public.exam_attempts;
BEGIN
 SELECT * INTO a FROM public.exam_attempts WHERE id=p_attempt_id AND user_id=auth.uid() FOR UPDATE;
 IF a.id IS NULL THEN RAISE EXCEPTION 'পরীক্ষা পাওয়া যায়নি'; END IF;
 UPDATE public.exam_attempts SET finished_at=COALESCE(finished_at,now()) WHERE id=a.id;
END $$;
REVOKE ALL ON FUNCTION public.finish_exam(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finish_exam(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public._grade(p_question_id uuid, p_option_id uuid, p_part_id uuid, p_self_correct boolean, OUT ok boolean, OUT marks integer) RETURNS record LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE qt text;
BEGIN
 SELECT type INTO qt FROM public.questions WHERE id=p_question_id;
 IF qt IS NULL THEN RAISE EXCEPTION 'প্রশ্ন পাওয়া যায়নি'; END IF;
 IF qt='mcq' THEN
  IF p_part_id IS NOT NULL THEN RAISE EXCEPTION 'MCQ-তে সৃজনশীল অংশ দেওয়া যাবে না'; END IF;
  SELECT o.is_correct INTO ok FROM public.question_options o WHERE o.id=p_option_id AND o.question_id=p_question_id;
  IF ok IS NULL THEN RAISE EXCEPTION 'অপশন সঠিক নয়'; END IF;
  marks:=1;
 ELSE
  SELECT cp.marks INTO marks FROM public.creative_parts cp WHERE cp.id=p_part_id AND cp.question_id=p_question_id;
  IF marks IS NULL THEN RAISE EXCEPTION 'অংশ পাওয়া যায়নি'; END IF;
  ok:=COALESCE(p_self_correct,false);
 END IF;
END $$;
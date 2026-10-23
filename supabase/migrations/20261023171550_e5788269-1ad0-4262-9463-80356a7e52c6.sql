CREATE OR REPLACE FUNCTION public.admin_save_questions(p_folder_id uuid, p_questions jsonb) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE q jsonb; item jsonb; qid uuid; old_type text; idx integer; n integer;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'শুধু অ্যাডমিন প্রশ্ন পরিবর্তন করতে পারবেন'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.exam_folders WHERE id=p_folder_id) THEN RAISE EXCEPTION 'ফোল্ডার পাওয়া যায়নি'; END IF;
 IF jsonb_typeof(p_questions) <> 'array' OR jsonb_array_length(p_questions) NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'একবারে ১–৫০টি প্রশ্ন দিন'; END IF;
 FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
  qid := (q->>'id')::uuid;
  IF qid IS NULL OR coalesce(btrim(q->>'question_text'),'')='' OR coalesce(q->>'type','') NOT IN ('mcq','creative') THEN RAISE EXCEPTION 'প্রশ্নের তথ্য অসম্পূর্ণ'; END IF;
  SELECT type INTO old_type FROM public.questions WHERE id=qid;
  IF old_type IS NOT NULL AND (old_type<>q->>'type' OR NOT EXISTS(SELECT 1 FROM public.questions WHERE id=qid AND folder_id=p_folder_id)) THEN RAISE EXCEPTION 'বিদ্যমান প্রশ্নের ধরন বা ফোল্ডার বদলানো যাবে না'; END IF;
  INSERT INTO public.questions(id,folder_id,type,question_text,image_url,explanation,sort_order) VALUES(qid,p_folder_id,q->>'type',q->>'question_text',nullif(q->>'image_url',''),nullif(q->>'explanation',''),(q->>'sort_order')::integer)
  ON CONFLICT(id) DO UPDATE SET question_text=excluded.question_text,image_url=excluded.image_url,explanation=excluded.explanation;
  IF q->>'type'='mcq' THEN
   IF jsonb_typeof(q->'options') IS DISTINCT FROM 'array' OR jsonb_array_length(q->'options')<>4 THEN RAISE EXCEPTION 'চারটি অপশন দিন'; END IF;
   SELECT count(*) INTO n FROM jsonb_array_elements(q->'options') a WHERE (a->>'is_correct')::boolean IS TRUE;
   IF n<>1 THEN RAISE EXCEPTION 'একটি সঠিক অপশন বেছে নিন'; END IF;
   idx:=0;
   FOR item IN SELECT value FROM jsonb_array_elements(q->'options') LOOP
    idx:=idx+1;
    IF coalesce(btrim(item->>'option_text'),'')='' THEN RAISE EXCEPTION 'অপশন ফাঁকা রাখা যাবে না'; END IF;
    UPDATE public.question_options SET option_text=item->>'option_text',is_correct=(item->>'is_correct')::boolean WHERE question_id=qid AND order_index=idx;
    IF NOT FOUND THEN INSERT INTO public.question_options(question_id,option_text,is_correct,order_index) VALUES(qid,item->>'option_text',(item->>'is_correct')::boolean,idx); END IF;
   END LOOP;
  ELSE
   IF jsonb_typeof(q->'parts') IS DISTINCT FROM 'array' OR jsonb_array_length(q->'parts')<>4 THEN RAISE EXCEPTION 'ক থেকে ঘ পর্যন্ত চারটি অংশ দিন'; END IF;
   IF (SELECT count(DISTINCT a->>'part_key') FROM jsonb_array_elements(q->'parts') a WHERE a->>'part_key' IN ('ka','kha','ga','gha'))<>4 THEN RAISE EXCEPTION 'অংশের নাম সঠিক নয়'; END IF;
   FOR item IN SELECT value FROM jsonb_array_elements(q->'parts') LOOP
    IF coalesce(btrim(item->>'question_text'),'')='' OR coalesce(btrim(item->>'model_answer'),'')='' OR coalesce((item->>'marks')::integer,0)<1 THEN RAISE EXCEPTION 'প্রতি অংশে প্রশ্ন, উত্তর ও ধনাত্মক নম্বর দিন'; END IF;
    INSERT INTO public.creative_parts(question_id,part_key,question_text,model_answer,marks) VALUES(qid,item->>'part_key',item->>'question_text',item->>'model_answer',(item->>'marks')::integer)
    ON CONFLICT(question_id,part_key) DO UPDATE SET question_text=excluded.question_text,model_answer=excluded.model_answer,marks=excluded.marks;
   END LOOP;
  END IF;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.admin_save_questions(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_save_questions(uuid,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.admin_set_folder_free(p_folder_id uuid,p_is_free boolean,p_recursive boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'শুধু অ্যাডমিন পরিবর্তন করতে পারবেন'; END IF;
 WITH RECURSIVE tree AS (SELECT id FROM public.exam_folders WHERE id=p_folder_id UNION SELECT f.id FROM public.exam_folders f JOIN tree t ON f.parent_id=t.id WHERE p_recursive)
 UPDATE public.exam_folders SET is_free=p_is_free WHERE id IN (SELECT id FROM tree);
END $$;
REVOKE ALL ON FUNCTION public.admin_set_folder_free(uuid,boolean,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_set_folder_free(uuid,boolean,boolean) TO authenticated;
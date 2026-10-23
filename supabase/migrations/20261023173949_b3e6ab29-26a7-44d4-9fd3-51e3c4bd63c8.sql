ALTER FUNCTION public.start_exam(uuid) SECURITY DEFINER;
ALTER FUNCTION public.answer_question(uuid,uuid,uuid,uuid,boolean) SECURITY DEFINER;
ALTER FUNCTION public.practice_mistake(uuid,uuid,uuid,boolean) SECURITY DEFINER;
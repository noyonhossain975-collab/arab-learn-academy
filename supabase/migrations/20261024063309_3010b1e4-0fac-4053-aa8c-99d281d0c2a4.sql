CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 600),
  kind text NOT NULL DEFAULT 'update' CHECK (kind IN ('feature','update','offer','important')),
  link_url text CHECK (link_url IS NULL OR link_url ~ '^(https?://|/)'),
  link_label text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read active announcements" ON public.announcements FOR SELECT TO authenticated USING (is_active OR public.is_admin());
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE OR REPLACE FUNCTION public.touch_announcement_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.touch_announcement_updated_at();
INSERT INTO public.announcements (title, body, kind, sort_order) VALUES ('Arab learn-এ স্বাগতম!', 'প্রতিদিন একটি পাঠ পড়ুন আর পরীক্ষা দিয়ে নিজের অগ্রগতি দেখুন।', 'feature', 0);

create type public.app_role as enum ('admin','student');

create or replace function public.update_updated_at_column() returns trigger
language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

create or replace function public.dhaka_today() returns date
language sql stable set search_path = public as $$ select (now() at time zone 'Asia/Dhaka')::date $$;

-- ===== TABLES =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, avatar_url text,
  theme_pref text not null default 'default' check (theme_pref in ('light','dark','default')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index profiles_email_idx on public.profiles (lower(email));

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.site_settings (
  key text primary key, value jsonb,
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null, duration_days int not null check (duration_days > 0),
  price numeric(10,2) not null default 0, features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null default 'active' check (status in ('active','expired','cancelled')),
  starts_at timestamptz not null default now(), expires_at timestamptz not null,
  payment_method text check (payment_method in ('bkash','nagad','other')),
  payment_note text, activated_by uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id, status, expires_at);

create table public.lesson_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null, description text,
  section text not null default 'arabic_education',
  free_lesson_limit int not null default 0 check (free_lesson_limit >= 0),
  sort_order int not null default 0, is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.lesson_groups(id) on delete cascade,
  title text not null, content text not null default '',
  order_index int not null default 0, is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index lessons_group_idx on public.lessons (group_id, order_index);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.vocab_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text,
  is_free boolean not null default false, sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.vocab_words (
  id uuid primary key default gen_random_uuid(),
  vocab_topic_id uuid not null references public.vocab_topics(id) on delete cascade,
  arabic text not null, pronunciation_bn text, meaning_bn text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index vocab_words_topic_idx on public.vocab_words (vocab_topic_id, order_index);

create table public.exam_folders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.exam_folders(id) on delete cascade,
  root_key text check (root_key in ('board_past','tahqiq','question_bank')),
  title text not null, sort_order int not null default 0,
  is_free boolean not null default false, is_published boolean not null default true,
  is_system boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index exam_folders_root_key_uidx on public.exam_folders (root_key) where root_key is not null;
create index exam_folders_parent_idx on public.exam_folders (parent_id, sort_order);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.exam_folders(id) on delete cascade,
  type text not null default 'mcq' check (type in ('mcq','creative')),
  question_text text not null, image_url text, explanation text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index questions_folder_idx on public.questions (folder_id, sort_order);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null, is_correct boolean not null default false,
  order_index int not null default 0
);
create index question_options_q_idx on public.question_options (question_id, order_index);

create table public.creative_parts (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  part_key text not null check (part_key in ('ka','kha','ga','gha')),
  question_text text not null, model_answer text, marks int not null default 1,
  unique (question_id, part_key)
);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  folder_id uuid references public.exam_folders(id) on delete set null,
  started_at timestamptz not null default now(), finished_at timestamptz,
  score int not null default 0, total int not null default 0
);
create index exam_attempts_user_idx on public.exam_attempts (user_id, started_at desc);

create table public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  part_id uuid references public.creative_parts(id) on delete cascade,
  selected_option_id uuid references public.question_options(id) on delete set null,
  written_answer text, is_correct boolean not null default false,
  created_at timestamptz not null default now()
);
create index attempt_answers_attempt_idx on public.attempt_answers (attempt_id);
create index attempt_answers_question_idx on public.attempt_answers (question_id);

create table public.saved_mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  times_wrong int not null default 1, is_resolved boolean not null default false,
  last_wrong_at timestamptz not null default now(), resolved_at timestamptz,
  unique (user_id, question_id)
);

create table public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null default public.dhaka_today(),
  points int not null default 0, lessons_completed int not null default 0,
  questions_answered int not null default 0,
  unique (user_id, activity_date)
);
create index daily_activity_date_idx on public.daily_activity (activity_date);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique, cover_image_url text,
  content text not null default '', is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.community_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook','youtube','email','whatsapp','telegram','other')),
  title text not null, url text not null, sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  kind text not null default 'general' check (kind in ('question_error','general')),
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  admin_reply text, replied_at timestamptz,
  reply_seen_by_student boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index reports_status_idx on public.reports (status, created_at desc);
create index reports_user_idx on public.reports (user_id);

-- updated_at triggers
do $$ declare t text; begin
  foreach t in array array['profiles','site_settings','plans','subscriptions','lesson_groups','lessons','vocab_topics','vocab_words','exam_folders','questions','blog_posts','community_links','reports'] loop
    execute format('create trigger trg_%1$s_updated before update on public.%1$I for each row execute function public.update_updated_at_column()', t);
  end loop;
end $$;

-- ===== HELPER FUNCTIONS =====
create or replace function public.has_role(_user_id uuid, _role public.app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin') $$;

create or replace function public.has_active_subscription(_user_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.subscriptions
    where user_id = _user_id and status = 'active' and expires_at > now()) $$;

create or replace function public.can_access_lesson(_user_id uuid, _lesson_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.lessons l join public.lesson_groups g on g.id = l.group_id
    where l.id = _lesson_id and l.is_published and g.is_published
      and (public.has_active_subscription(_user_id)
        or (select count(*) from public.lessons l2
            where l2.group_id = l.group_id and l2.is_published
              and (l2.order_index, l2.id) <= (l.order_index, l.id)) <= g.free_lesson_limit))
$$;

create or replace function public.can_access_vocab_topic(_user_id uuid, _topic_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vocab_topics t where t.id = _topic_id and t.is_published
    and (t.is_free or public.has_active_subscription(_user_id))) $$;

create or replace function public.can_access_folder(_user_id uuid, _folder_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.exam_folders f where f.id = _folder_id and f.is_published
    and (f.is_free or public.has_active_subscription(_user_id))) $$;

create or replace function public.folder_root_key(_folder_id uuid) returns text
language sql stable security definer set search_path = public as $$
  with recursive up as (
    select id, parent_id, root_key from public.exam_folders where id = _folder_id
    union all
    select f.id, f.parent_id, f.root_key from public.exam_folders f join up on f.id = up.parent_id)
  select root_key from up where parent_id is null limit 1 $$;

-- Lesson list with lock flags (titles only, never content)
create or replace function public.get_group_lessons(p_group_id uuid)
returns table (id uuid, title text, order_index int, lesson_position bigint, is_locked boolean, is_completed boolean)
language sql stable security definer set search_path = public as $$
  select l.id, l.title, l.order_index,
    row_number() over (order by l.order_index, l.id) as lesson_position,
    not public.can_access_lesson(auth.uid(), l.id) as is_locked,
    exists (select 1 from public.lesson_progress p where p.lesson_id = l.id and p.user_id = auth.uid())
  from public.lessons l join public.lesson_groups g on g.id = l.group_id
  where l.group_id = p_group_id and l.is_published and g.is_published
  order by l.order_index, l.id $$;

-- Creative questions only allowed in the board_past tree
create or replace function public.enforce_question_type() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.type = 'creative' and coalesce(public.folder_root_key(new.folder_id), '') <> 'board_past' then
    raise exception 'সৃজনশীল প্রশ্ন শুধু বোর্ড পরীক্ষার ফোল্ডারে রাখা যাবে';
  end if;
  return new;
end $$;
create trigger trg_questions_type before insert or update on public.questions
  for each row execute function public.enforce_question_type();

-- System root folders cannot be deleted
create or replace function public.protect_system_folders() returns trigger
language plpgsql set search_path = public as $$
begin
  if old.is_system and pg_trigger_depth() = 1 then raise exception 'মূল ফোল্ডার মুছে ফেলা যাবে না'; end if;
  return old;
end $$;
create trigger trg_exam_folders_protect before delete on public.exam_folders
  for each row execute function public.protect_system_folders();

-- Students may only change reply_seen_by_student on their reports
create or replace function public.guard_report_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if not public.is_admin() then
    if new.message is distinct from old.message or new.status is distinct from old.status
       or new.admin_reply is distinct from old.admin_reply or new.replied_at is distinct from old.replied_at
       or new.user_id is distinct from old.user_id or new.question_id is distinct from old.question_id
       or new.kind is distinct from old.kind then
      raise exception 'অনুমতি নেই';
    end if;
  end if;
  return new;
end $$;
create trigger trg_reports_guard before update on public.reports
  for each row execute function public.guard_report_update();

-- ===== SIGNUP + INITIAL ADMIN =====
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_admin text;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'student') on conflict do nothing;
  select value #>> '{}' into v_admin from public.site_settings where key = 'initial_admin_email';
  if v_admin is not null and lower(trim(v_admin)) = lower(new.email) then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.apply_initial_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.key = 'initial_admin_email' then
    insert into public.user_roles (user_id, role)
    select p.id, 'admin' from public.profiles p
    where lower(p.email) = lower(trim(new.value #>> '{}'))
    on conflict do nothing;
  end if;
  return new;
end $$;
create trigger trg_site_settings_admin after insert or update on public.site_settings
  for each row execute function public.apply_initial_admin();

-- ===== STUDENT FUNCTIONS =====
create or replace function public.touch_last_seen() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  update public.profiles set last_seen_at = now()
    where id = auth.uid() and (last_seen_at is null or last_seen_at < now() - interval '1 hour');
  insert into public.daily_activity (user_id, activity_date) values (auth.uid(), public.dhaka_today())
    on conflict (user_id, activity_date) do nothing;
end $$;

-- ===== ADMIN FUNCTIONS =====
create or replace function public.admin_set_subscription(p_email text, p_plan_id uuid, p_payment_method text, p_note text)
returns public.subscriptions
language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_days int; v_cur timestamptz; r public.subscriptions;
begin
  if not public.is_admin() then raise exception 'অনুমতি নেই'; end if;
  select id into v_user from public.profiles where lower(email) = lower(trim(p_email));
  if v_user is null then raise exception 'এই ইমেইলে কোনো ছাত্র পাওয়া যায়নি'; end if;
  select duration_days into v_days from public.plans where id = p_plan_id;
  if v_days is null then raise exception 'প্ল্যান পাওয়া যায়নি'; end if;
  update public.subscriptions set status = 'expired'
    where user_id = v_user and status = 'active' and expires_at <= now();
  select max(expires_at) into v_cur from public.subscriptions
    where user_id = v_user and status = 'active' and expires_at > now();
  insert into public.subscriptions (user_id, plan_id, status, starts_at, expires_at, payment_method, payment_note, activated_by)
  values (v_user, p_plan_id, 'active', now(), coalesce(v_cur, now()) + make_interval(days => v_days),
          p_payment_method, p_note, auth.uid())
  returning * into r;
  return r;
end $$;

create or replace function public.admin_cancel_subscription(p_user_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'অনুমতি নেই'; end if;
  update public.subscriptions set status = 'cancelled' where user_id = p_user_id and status = 'active';
end $$;

create or replace function public.admin_dashboard_stats() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'অনুমতি নেই'; end if;
  return json_build_object(
    'total_students', (select count(*) from public.profiles),
    'active_today', (select count(*) from public.daily_activity where activity_date = public.dhaka_today()),
    'premium_students', (select count(distinct user_id) from public.subscriptions where status='active' and expires_at > now()),
    'expiring_7d', (select count(distinct user_id) from public.subscriptions where status='active' and expires_at > now() and expires_at <= now() + interval '7 days'),
    'new_reports', (select count(*) from public.reports where status = 'new'),
    'inactive_7d', (select count(*) from public.profiles where last_seen_at is null or last_seen_at < now() - interval '7 days'));
end $$;

create or replace function public.admin_signups_per_day(p_days int)
returns table (day date, count bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'অনুমতি নেই'; end if;
  return query
  select d::date, (select count(*) from public.profiles p where (p.created_at at time zone 'Asia/Dhaka')::date = d::date)
  from generate_series(public.dhaka_today() - (p_days - 1), public.dhaka_today(), interval '1 day') d
  order by 1;
end $$;

create or replace function public.admin_active_per_day(p_days int)
returns table (day date, count bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'অনুমতি নেই'; end if;
  return query
  select d::date, (select count(*) from public.daily_activity a where a.activity_date = d::date)
  from generate_series(public.dhaka_today() - (p_days - 1), public.dhaka_today(), interval '1 day') d
  order by 1;
end $$;

-- ===== GRANTS =====
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant select on public.site_settings, public.plans, public.lesson_groups, public.vocab_topics,
  public.exam_folders, public.blog_posts, public.community_links to anon;

-- ===== RLS =====
do $$ declare t text; begin
  foreach t in array array['profiles','user_roles','site_settings','plans','subscriptions','lesson_groups','lessons','lesson_progress','vocab_topics','vocab_words','exam_folders','questions','question_options','creative_parts','exam_attempts','attempt_answers','saved_mistakes','daily_activity','blog_posts','community_links','reports'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Admins manage %1$s" on public.%1$I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "Own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid());

create policy "Public settings read" on public.site_settings for select to anon, authenticated using (key <> 'initial_admin_email');
create policy "Active plans read" on public.plans for select to anon, authenticated using (is_active);
create policy "Own subscriptions read" on public.subscriptions for select to authenticated using (user_id = auth.uid());

create policy "Published groups read" on public.lesson_groups for select to anon, authenticated using (is_published);
create policy "Accessible lessons read" on public.lessons for select to authenticated using (public.can_access_lesson(auth.uid(), id));
create policy "Own lesson progress" on public.lesson_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Published vocab topics read" on public.vocab_topics for select to anon, authenticated using (is_published);
create policy "Accessible words read" on public.vocab_words for select to authenticated using (public.can_access_vocab_topic(auth.uid(), vocab_topic_id));

create policy "Published folders read" on public.exam_folders for select to anon, authenticated using (is_published);
create policy "Accessible questions read" on public.questions for select to authenticated using (public.can_access_folder(auth.uid(), folder_id));
create policy "Accessible options read" on public.question_options for select to authenticated
  using (exists (select 1 from public.questions q where q.id = question_id and public.can_access_folder(auth.uid(), q.folder_id)));
create policy "Accessible parts read" on public.creative_parts for select to authenticated
  using (exists (select 1 from public.questions q where q.id = question_id and public.can_access_folder(auth.uid(), q.folder_id)));

create policy "Own attempts" on public.exam_attempts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own attempt answers" on public.attempt_answers for all to authenticated
  using (exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "Own mistakes" on public.saved_mistakes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Own activity" on public.daily_activity for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Published posts read" on public.blog_posts for select to anon, authenticated using (is_published);
create policy "Active links read" on public.community_links for select to anon, authenticated using (is_active);

create policy "Own reports read" on public.reports for select to authenticated using (user_id = auth.uid());
create policy "Own reports insert" on public.reports for insert to authenticated
  with check (user_id = auth.uid() and status = 'new' and admin_reply is null);
create policy "Own reports mark seen" on public.reports for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ===== SEED DATA =====
-- PUT MY EMAIL HERE  (replace the email below with your own; that account becomes admin)
insert into public.site_settings (key, value) values ('initial_admin_email', to_jsonb('PUT_YOUR_EMAIL@example.com'::text));
insert into public.site_settings (key, value) values
  ('whatsapp_number', to_jsonb('8801XXXXXXXXX'::text)),
  ('whatsapp_message_template', to_jsonb('আসসালামু আলাইকুম! আমি Arab learn এর {plan} প্ল্যান ({price} টাকা) কিনতে চাই। নাম: {name}, ইমেইল: {email}'::text));

insert into public.plans (name, duration_days, price, features, sort_order) values
  ('১ মাস', 30, 99, '["সব লেসন আনলক","সব শব্দভান্ডার","সব পরীক্ষা ও প্রশ্নব্যাংক"]', 1),
  ('৩ মাস', 90, 249, '["সব লেসন আনলক","সব শব্দভান্ডার","সব পরীক্ষা ও প্রশ্নব্যাংক"]', 2),
  ('১ বছর', 365, 799, '["সব লেসন আনলক","সব শব্দভান্ডার","সব পরীক্ষা ও প্রশ্নব্যাংক"]', 3);

insert into public.community_links (platform, title, url, sort_order) values
  ('facebook', 'ফেসবুক গ্রুপ', 'https://facebook.com', 1);

do $$
declare g_nahu uuid; g_sarf uuid; g_qayda uuid; v1 uuid; v2 uuid;
  f_board uuid; f_tahqiq uuid; f_qb uuid; f_quran uuid; f_hadith uuid; f_aqaid uuid; f_hist uuid; f_board_ar uuid;
  q uuid; i int;
begin
  insert into public.lesson_groups (slug, title, description, free_lesson_limit, sort_order) values
    ('nahu','নাহু','আরবি বাক্য গঠনের নিয়ম', 2, 1) returning id into g_nahu;
  insert into public.lesson_groups (slug, title, description, free_lesson_limit, sort_order) values
    ('sarf','সরফ','শব্দের রূপান্তরের নিয়ম', 1, 2) returning id into g_sarf;
  insert into public.lesson_groups (slug, title, description, free_lesson_limit, sort_order) values
    ('qayda','কায়দা','আরবি হরফ ও উচ্চারণ', 2, 3) returning id into g_qayda;

  insert into public.lessons (group_id, title, content, order_index, is_published) values
    (g_nahu, 'কালিমা কী?', '<h2>কালিমা (الكلمة)</h2><p>অর্থবোধক একক শব্দকে কালিমা বলে।</p><p dir="auto">الْكَلِمَةُ لَفْظٌ وُضِعَ لِمَعْنًى مُفْرَدٍ</p>', 1, true),
    (g_nahu, 'কালিমার প্রকারভেদ', '<p>কালিমা তিন প্রকার: ইসম, ফে''ল, হরফ।</p><p dir="auto">اِسْمٌ ، فِعْلٌ ، حَرْفٌ</p>', 2, true),
    (g_nahu, 'ইসমের আলামত', '<p>ইসম চেনার কিছু চিহ্ন আছে।</p>', 3, true),
    (g_sarf, 'সরফের পরিচয়', '<p>সরফ হলো শব্দের রূপান্তরের শাস্ত্র।</p><p dir="auto">عِلْمُ الصَّرْفِ</p>', 1, true),
    (g_sarf, 'মাসদার', '<p>মাসদার হলো ক্রিয়ার মূল।</p>', 2, true),
    (g_qayda, 'আরবি হরফ', '<p dir="auto">ا ب ت ث ج ح خ</p>', 1, true),
    (g_qayda, 'হরকত', '<p>যবর, যের, পেশ।</p><p dir="auto">بَ بِ بُ</p>', 2, true);

  insert into public.vocab_topics (title, description, is_free, sort_order) values
    ('সালাম আদান প্রদান','সালাম ও শুভেচ্ছার শব্দ', true, 1) returning id into v1;
  insert into public.vocab_topics (title, description, is_free, sort_order) values
    ('পরিবার','পরিবারের সদস্যদের নাম', false, 2) returning id into v2;
  insert into public.vocab_words (vocab_topic_id, arabic, pronunciation_bn, meaning_bn, order_index) values
    (v1, 'السَّلَامُ عَلَيْكُمْ', 'আসসালামু আলাইকুম', 'আপনার উপর শান্তি বর্ষিত হোক', 1),
    (v1, 'وَعَلَيْكُمُ السَّلَامُ', 'ওয়া আলাইকুমুস সালাম', 'আপনার উপরও শান্তি', 2),
    (v1, 'مَرْحَبًا', 'মারহাবান', 'স্বাগতম', 3),
    (v1, 'شُكْرًا', 'শুকরান', 'ধন্যবাদ', 4),
    (v2, 'أَبٌ', 'আবুন', 'বাবা', 1),
    (v2, 'أُمٌّ', 'উম্মুন', 'মা', 2),
    (v2, 'أَخٌ', 'আখুন', 'ভাই', 3);

  insert into public.exam_folders (root_key, title, sort_order, is_system, is_free) values
    ('board_past','বিগত বছরের মাদ্রাসা বোর্ড পরীক্ষা',1,true,true) returning id into f_board;
  insert into public.exam_folders (root_key, title, sort_order, is_system, is_free) values
    ('tahqiq','স্পেশাল তাহকীক পরীক্ষা',2,true,true) returning id into f_tahqiq;
  insert into public.exam_folders (root_key, title, sort_order, is_system, is_free) values
    ('question_bank','আরবি বিষয়ের প্রশ্নব্যাংক',3,true,true) returning id into f_qb;
  insert into public.exam_folders (parent_id, title, sort_order, is_free) values (f_qb,'কুরআন মাজিদ',1,true) returning id into f_quran;
  insert into public.exam_folders (parent_id, title, sort_order, is_free) values (f_qb,'হাদিস শরীফ',2,false) returning id into f_hadith;
  insert into public.exam_folders (parent_id, title, sort_order, is_free) values (f_qb,'আকাইদ ও ফিকহ',3,false) returning id into f_aqaid;
  insert into public.exam_folders (parent_id, title, sort_order, is_free) values (f_qb,'ইসলামের ইতিহাস',4,false) returning id into f_hist;
  insert into public.exam_folders (parent_id, title, sort_order, is_free) values (f_board,'আরবি ১ম পত্র — ২০২৩',1,true) returning id into f_board_ar;

  -- MCQ helper inserts
  insert into public.questions (folder_id, type, question_text, explanation, sort_order)
    values (f_quran,'mcq','কুরআন মাজিদে মোট কতটি সূরা আছে?','কুরআন মাজিদে ১১৪টি সূরা আছে।',1) returning id into q;
  insert into public.question_options (question_id, option_text, is_correct, order_index) values
    (q,'১১০',false,1),(q,'১১৪',true,2),(q,'১২০',false,3),(q,'১০০',false,4);

  insert into public.questions (folder_id, type, question_text, explanation, sort_order)
    values (f_quran,'mcq','কুরআনের প্রথম সূরা কোনটি?','প্রথম সূরা হলো সূরা আল-ফাতিহা।',2) returning id into q;
  insert into public.question_options (question_id, option_text, is_correct, order_index) values
    (q,'সূরা বাকারা',false,1),(q,'সূরা নাস',false,2),(q,'সূরা ফাতিহা',true,3),(q,'সূরা ইখলাস',false,4);

  insert into public.questions (folder_id, type, question_text, explanation, sort_order)
    values (f_hadith,'mcq','সহিহ বুখারীর সংকলক কে?','ইমাম মুহাম্মাদ ইবনে ইসমাঈল আল-বুখারী।',1) returning id into q;
  insert into public.question_options (question_id, option_text, is_correct, order_index) values
    (q,'ইমাম মুসলিম',false,1),(q,'ইমাম বুখারী',true,2),(q,'ইমাম তিরমিযী',false,3),(q,'ইমাম আবু দাউদ',false,4);

  insert into public.questions (folder_id, type, question_text, explanation, sort_order)
    values (f_tahqiq,'mcq','"كِتَابٌ" শব্দটি কোন প্রকার কালিমা?','كِتَابٌ একটি ইসম, কারণ এতে তানভীন আছে।',1) returning id into q;
  insert into public.question_options (question_id, option_text, is_correct, order_index) values
    (q,'ইসম',true,1),(q,'ফে''ল',false,2),(q,'হরফ',false,3),(q,'কোনোটিই নয়',false,4);

  insert into public.questions (folder_id, type, question_text, explanation, sort_order)
    values (f_board_ar,'mcq','"ذَهَبَ" কোন প্রকার কালিমা?','ذَهَبَ অতীত কালের ফে''ল।',1) returning id into q;
  insert into public.question_options (question_id, option_text, is_correct, order_index) values
    (q,'ইসম',false,1),(q,'ফে''ল',true,2),(q,'হরফ',false,3),(q,'মাসদার',false,4);

  insert into public.questions (folder_id, type, question_text, sort_order)
    values (f_board_ar,'creative','উদ্দীপক: জায়েদ বলল — ذَهَبَ زَيْدٌ إِلَى الْمَسْجِدِ', 2) returning id into q;
  insert into public.creative_parts (question_id, part_key, question_text, model_answer, marks) values
    (q,'ka','কালিমা কাকে বলে?','অর্থবোধক একক শব্দকে কালিমা বলে।',1),
    (q,'kha','উদ্দীপকের ফে''লটি চিহ্নিত করো।','ذَهَبَ হলো ফে''ল।',2),
    (q,'ga','উদ্দীপকের ইসমগুলো ব্যাখ্যা করো।','زَيْدٌ ও الْمَسْجِدِ হলো ইসম।',3),
    (q,'gha','উদ্দীপকের বাক্যটির তারকীব বিশ্লেষণ করো।','ذَهَبَ ফে''ল, زَيْدٌ ফায়েল, إِلَى الْمَسْجِدِ জার-মাজরুর।',4);
end $$;


revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.apply_initial_admin() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.has_active_subscription(uuid) from public, anon;
revoke execute on function public.can_access_lesson(uuid, uuid) from public, anon;
revoke execute on function public.can_access_vocab_topic(uuid, uuid) from public, anon;
revoke execute on function public.can_access_folder(uuid, uuid) from public, anon;
revoke execute on function public.folder_root_key(uuid) from public, anon;
revoke execute on function public.get_group_lessons(uuid) from public, anon;
revoke execute on function public.touch_last_seen() from public, anon;
revoke execute on function public.admin_set_subscription(text, uuid, text, text) from public, anon;
revoke execute on function public.admin_cancel_subscription(uuid) from public, anon;
revoke execute on function public.admin_dashboard_stats() from public, anon;
revoke execute on function public.admin_signups_per_day(int) from public, anon;
revoke execute on function public.admin_active_per_day(int) from public, anon;
grant execute on function public.has_role(uuid, public.app_role), public.is_admin(), public.has_active_subscription(uuid),
  public.can_access_lesson(uuid, uuid), public.can_access_vocab_topic(uuid, uuid), public.can_access_folder(uuid, uuid),
  public.folder_root_key(uuid), public.get_group_lessons(uuid), public.touch_last_seen(),
  public.admin_set_subscription(text, uuid, text, text), public.admin_cancel_subscription(uuid),
  public.admin_dashboard_stats(), public.admin_signups_per_day(int), public.admin_active_per_day(int) to authenticated;

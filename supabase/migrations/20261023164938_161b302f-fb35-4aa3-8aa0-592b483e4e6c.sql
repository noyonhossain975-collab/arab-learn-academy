create policy "Admins manage content images" on storage.objects for all to authenticated
  using (bucket_id = 'content-images' and public.is_admin())
  with check (bucket_id = 'content-images' and public.is_admin());
create policy "Signed-in read content images" on storage.objects for select to authenticated
  using (bucket_id = 'content-images');
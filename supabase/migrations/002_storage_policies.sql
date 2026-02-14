-- Storage policies for event-photos bucket
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-photos');

create policy "Authenticated users can update own photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-photos');

create policy "Authenticated users can delete own photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-photos');

create policy "Public can view event photos"
  on storage.objects for select
  to public
  using (bucket_id = 'event-photos');

-- Storage policies for event-music bucket
create policy "Authenticated users can upload music"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-music');

create policy "Authenticated users can update own music"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-music');

create policy "Authenticated users can delete own music"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-music');

create policy "Public can view event music"
  on storage.objects for select
  to public
  using (bucket_id = 'event-music');

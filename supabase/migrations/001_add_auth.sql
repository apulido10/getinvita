-- Add user_id to events table
alter table events add column user_id uuid references auth.users(id);

-- Index for fast lookups by user
create index idx_events_user_id on events(user_id);

-- Drop old RLS policies
drop policy if exists "Public can view published events" on events;
drop policy if exists "Public can view published event details" on event_details;
drop policy if exists "Public can view published event photos" on event_photos;
drop policy if exists "Public can view published event music" on event_music;
drop policy if exists "Public can RSVP to published events" on rsvps;
drop policy if exists "Public can view RSVPs for published events" on rsvps;

-- Public read for published events
create policy "Public can view published events"
  on events for select
  using (status = 'published');

create policy "Public can view published event details"
  on event_details for select
  using (exists (
    select 1 from events where events.id = event_details.event_id and events.status = 'published'
  ));

create policy "Public can view published event photos"
  on event_photos for select
  using (exists (
    select 1 from events where events.id = event_photos.event_id and events.status = 'published'
  ));

create policy "Public can view published event music"
  on event_music for select
  using (exists (
    select 1 from events where events.id = event_music.event_id and events.status = 'published'
  ));

-- Public RSVP insert + read for published events
create policy "Public can RSVP to published events"
  on rsvps for insert
  with check (exists (
    select 1 from events where events.id = rsvps.event_id and events.status = 'published'
  ));

create policy "Public can view RSVPs for published events"
  on rsvps for select
  using (exists (
    select 1 from events where events.id = rsvps.event_id and events.status = 'published'
  ));

-- Authenticated users can SELECT their own events
create policy "Users can view own events"
  on events for select
  using (auth.uid() = user_id);

-- Authenticated users can INSERT events (with their user_id)
create policy "Users can create own events"
  on events for insert
  with check (auth.uid() = user_id);

-- Authenticated users can UPDATE their own events
create policy "Users can update own events"
  on events for update
  using (auth.uid() = user_id);

-- Authenticated users can DELETE their own events
create policy "Users can delete own events"
  on events for delete
  using (auth.uid() = user_id);

-- Authenticated users can CRUD event_details for their own events
create policy "Users can view own event details"
  on event_details for select
  using (exists (
    select 1 from events where events.id = event_details.event_id and events.user_id = auth.uid()
  ));

create policy "Users can insert own event details"
  on event_details for insert
  with check (exists (
    select 1 from events where events.id = event_details.event_id and events.user_id = auth.uid()
  ));

create policy "Users can update own event details"
  on event_details for update
  using (exists (
    select 1 from events where events.id = event_details.event_id and events.user_id = auth.uid()
  ));

create policy "Users can delete own event details"
  on event_details for delete
  using (exists (
    select 1 from events where events.id = event_details.event_id and events.user_id = auth.uid()
  ));

-- Authenticated users can CRUD event_photos for their own events
create policy "Users can view own event photos"
  on event_photos for select
  using (exists (
    select 1 from events where events.id = event_photos.event_id and events.user_id = auth.uid()
  ));

create policy "Users can insert own event photos"
  on event_photos for insert
  with check (exists (
    select 1 from events where events.id = event_photos.event_id and events.user_id = auth.uid()
  ));

create policy "Users can update own event photos"
  on event_photos for update
  using (exists (
    select 1 from events where events.id = event_photos.event_id and events.user_id = auth.uid()
  ));

create policy "Users can delete own event photos"
  on event_photos for delete
  using (exists (
    select 1 from events where events.id = event_photos.event_id and events.user_id = auth.uid()
  ));

-- Authenticated users can CRUD event_music for their own events
create policy "Users can view own event music"
  on event_music for select
  using (exists (
    select 1 from events where events.id = event_music.event_id and events.user_id = auth.uid()
  ));

create policy "Users can insert own event music"
  on event_music for insert
  with check (exists (
    select 1 from events where events.id = event_music.event_id and events.user_id = auth.uid()
  ));

create policy "Users can update own event music"
  on event_music for update
  using (exists (
    select 1 from events where events.id = event_music.event_id and events.user_id = auth.uid()
  ));

create policy "Users can delete own event music"
  on event_music for delete
  using (exists (
    select 1 from events where events.id = event_music.event_id and events.user_id = auth.uid()
  ));

-- Authenticated users can view RSVPs for their own events
create policy "Users can view own event RSVPs"
  on rsvps for select
  using (exists (
    select 1 from events where events.id = rsvps.event_id and events.user_id = auth.uid()
  ));

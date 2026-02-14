-- Event Sites Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Events table
create table events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  event_type text not null check (event_type in ('sweet15', 'wedding', 'birthday', 'baby_shower')),
  event_name text not null,
  event_date timestamptz,
  status text not null default 'pending' check (status in ('pending', 'paid', 'active', 'published')),
  client_name text not null,
  client_email text not null,
  access_token text unique not null,
  user_id uuid references auth.users(id),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Event details (flexible key-value)
create table event_details (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  detail_key text not null,
  detail_value text,
  created_at timestamptz default now(),
  unique(event_id, detail_key)
);

-- Event photos
create table event_photos (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  display_order int default 0,
  is_hero boolean default false,
  created_at timestamptz default now()
);

-- Event music
create table event_music (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  storage_path text not null,
  song_title text,
  artist text,
  created_at timestamptz default now()
);

-- RSVPs
create table rsvps (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  guest_name text not null,
  attending boolean default true,
  guest_count int default 1,
  message text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_events_slug on events(slug);
create index idx_events_access_token on events(access_token);
create index idx_events_status on events(status);
create index idx_events_user_id on events(user_id);
create index idx_event_details_event_id on event_details(event_id);
create index idx_event_photos_event_id on event_photos(event_id);
create index idx_event_music_event_id on event_music(event_id);
create index idx_rsvps_event_id on rsvps(event_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at();

-- RLS Policies
alter table events enable row level security;
alter table event_details enable row level security;
alter table event_photos enable row level security;
alter table event_music enable row level security;
alter table rsvps enable row level security;

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

-- Public RSVP insert for published events
create policy "Public can RSVP to published events"
  on rsvps for insert
  with check (exists (
    select 1 from events where events.id = rsvps.event_id and events.status = 'published'
  ));

-- Public can view RSVPs for published events
create policy "Public can view RSVPs for published events"
  on rsvps for select
  using (exists (
    select 1 from events where events.id = rsvps.event_id and events.status = 'published'
  ));

-- Authenticated users can CRUD their own events
create policy "Users can view own events"
  on events for select
  using (auth.uid() = user_id);

create policy "Users can create own events"
  on events for insert
  with check (auth.uid() = user_id);

create policy "Users can update own events"
  on events for update
  using (auth.uid() = user_id);

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

-- Storage buckets (run these in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('event-photos', 'event-photos', true);
-- insert into storage.buckets (id, name, public) values ('event-music', 'event-music', true);

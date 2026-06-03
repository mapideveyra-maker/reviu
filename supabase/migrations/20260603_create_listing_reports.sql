create table if not exists listing_reports (
  id uuid primary key default gen_random_uuid(),
  google_place_id text not null,
  place_name text,
  reported_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null
);

alter table listing_reports enable row level security;

-- Anyone (authenticated or anonymous) can insert a report
create policy "Anyone can report a listing"
  on listing_reports for insert
  with check (true);

-- Only admins can read reports (no public read)

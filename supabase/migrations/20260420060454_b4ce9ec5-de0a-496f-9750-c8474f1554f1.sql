create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  interest text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Anyone can submit a lead"
on public.leads
for insert
to anon, authenticated
with check (true);

create index idx_leads_created_at on public.leads (created_at desc);
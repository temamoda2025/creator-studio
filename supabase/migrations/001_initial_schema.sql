-- Creator Studio — initial schema
-- Run this in the Supabase dashboard SQL editor (Database → SQL Editor → New query)

-- ── brands ────────────────────────────────────────────────────────────────────
create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  name        text not null,
  niche       text,
  handle      text,
  created_at  timestamptz not null default now()
);

-- Row-level security: each user sees only their own brands
alter table public.brands enable row level security;

create policy "brands: owner access"
  on public.brands
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── brand_kit ─────────────────────────────────────────────────────────────────
create table if not exists public.brand_kit (
  brand_id          uuid primary key references public.brands (id) on delete cascade,
  primary_colour    text not null default '#1a1a1a',
  secondary_colour  text not null default '#ffffff',
  accent_colour     text not null default '#c4603c',
  heading_font      text not null default 'Inter',
  body_font         text not null default 'Inter',
  logo_base64       text,
  updated_at        timestamptz not null default now()
);

alter table public.brand_kit enable row level security;

create policy "brand_kit: owner access"
  on public.brand_kit
  for all
  using  (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));

-- ── brand_blueprint ───────────────────────────────────────────────────────────
create table if not exists public.brand_blueprint (
  brand_id     uuid primary key references public.brands (id) on delete cascade,
  mission      text,
  vision       text,
  positioning  text,
  pillars      jsonb,   -- array of { id, name, description, formats, frequency }
  voice        jsonb,   -- { traits: [...], captionExample }
  created_at   timestamptz not null default now()
);

alter table public.brand_blueprint enable row level security;

create policy "brand_blueprint: owner access"
  on public.brand_blueprint
  for all
  using  (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));

-- ── caption_history ───────────────────────────────────────────────────────────
create table if not exists public.caption_history (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null references public.brands (id) on delete cascade,
  caption     text not null,
  topic       text,
  format      text,
  created_at  timestamptz not null default now()
);

alter table public.caption_history enable row level security;

create policy "caption_history: owner access"
  on public.caption_history
  for all
  using  (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));

create index caption_history_brand_id_idx on public.caption_history (brand_id, created_at desc);

-- ── reel_script_history ───────────────────────────────────────────────────────
create table if not exists public.reel_script_history (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null references public.brands (id) on delete cascade,
  script      jsonb not null,  -- { hook, scenes: [...], cta, hashtags, ... }
  topic       text,
  duration    text,
  created_at  timestamptz not null default now()
);

alter table public.reel_script_history enable row level security;

create policy "reel_script_history: owner access"
  on public.reel_script_history
  for all
  using  (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.brands b where b.id = brand_id and b.user_id = auth.uid()));

create index reel_script_history_brand_id_idx on public.reel_script_history (brand_id, created_at desc);

-- ── updated_at trigger for brand_kit ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger brand_kit_updated_at
  before update on public.brand_kit
  for each row execute function public.set_updated_at();

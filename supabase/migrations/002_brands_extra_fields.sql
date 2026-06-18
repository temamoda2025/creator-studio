-- Add columns missing from initial brands schema
alter table public.brands
  add column if not exists platforms       text[]       not null default '{}',
  add column if not exists target_audience text         not null default '',
  add column if not exists positioning     text,
  add column if not exists mission         text,
  add column if not exists vision          text,
  add column if not exists brand_voice     jsonb        not null default '{"traits":[]}'::jsonb,
  add column if not exists updated_at      timestamptz  not null default now();

-- Add handle to brand_kit (design-specific display handle, separate from brand.handle)
alter table public.brand_kit
  add column if not exists handle text not null default '';

-- updated_at trigger for brands
create trigger brands_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- ── Dev bypass: disable RLS until auth is wired up ────────────────────────────
-- Remove this file's effects (re-enable RLS + drop bypass policies) once
-- Supabase Auth is integrated and auth.uid() is available in queries.
alter table public.brands              disable row level security;
alter table public.brand_kit           disable row level security;
alter table public.brand_blueprint     disable row level security;
alter table public.caption_history     disable row level security;
alter table public.reel_script_history disable row level security;

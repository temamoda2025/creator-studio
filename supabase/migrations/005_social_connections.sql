-- Social account connections
-- Run in Supabase dashboard → SQL Editor
--
-- Env vars required per platform:
--   Instagram:  META_APP_ID, META_APP_SECRET, META_REDIRECT_URI
--   TikTok:     TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI
--   YouTube:    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

create table if not exists public.social_connections (
  id                uuid        primary key default gen_random_uuid(),
  brand_id          uuid        not null references public.brands(id) on delete cascade,
  platform          text        not null,  -- instagram | tiktok | youtube
  access_token      text,
  refresh_token     text,
  expires_at        timestamptz,
  platform_user_id  text,
  platform_username text,
  connected_at      timestamptz not null default now(),
  constraint social_connections_brand_platform_unique unique (brand_id, platform)
);

alter table public.social_connections enable row level security;

create policy "social_connections: owner access"
  on public.social_connections
  for all
  using (
    exists (
      select 1 from public.brands b
      where b.id = brand_id
        and (b.user_id = auth.uid() or b.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    )
  )
  with check (
    exists (
      select 1 from public.brands b
      where b.id = brand_id
        and (b.user_id = auth.uid() or b.user_id = '00000000-0000-0000-0000-000000000001'::uuid)
    )
  );

create index social_connections_brand_idx
  on public.social_connections (brand_id, platform);

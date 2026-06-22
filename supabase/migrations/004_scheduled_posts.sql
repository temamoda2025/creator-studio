-- Content Calendar: scheduled posts table
-- Run in Supabase dashboard → SQL Editor

create table if not exists public.scheduled_posts (
  id             uuid        primary key default gen_random_uuid(),
  brand_id       uuid        not null references public.brands(id) on delete cascade,
  user_id        uuid        not null default '00000000-0000-0000-0000-000000000001',
  title          text        not null,
  caption        text,
  format         text        not null default 'static',  -- static | carousel | reel | story
  scheduled_date timestamptz not null,
  image_url      text,
  status         text        not null default 'draft',   -- draft | scheduled | published
  created_at     timestamptz not null default now()
);

alter table public.scheduled_posts enable row level security;

create policy "scheduled_posts: owner access"
  on public.scheduled_posts
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

create index scheduled_posts_brand_date_idx
  on public.scheduled_posts (brand_id, scheduled_date);

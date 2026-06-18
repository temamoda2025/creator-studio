-- Re-enable RLS on all tables and update policies to allow both real auth
-- and the hardcoded placeholder UUID (used until Supabase Auth is wired up).

-- ── brands ────────────────────────────────────────────────────────────────────
alter table public.brands enable row level security;

drop policy if exists "brands: owner access" on public.brands;

create policy "brands: owner access"
  on public.brands
  for all
  using  (auth.uid() = user_id or user_id = '00000000-0000-0000-0000-000000000001'::uuid)
  with check (auth.uid() = user_id or user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- ── brand_kit ─────────────────────────────────────────────────────────────────
alter table public.brand_kit enable row level security;

drop policy if exists "brand_kit: owner access" on public.brand_kit;

create policy "brand_kit: owner access"
  on public.brand_kit
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

-- ── brand_blueprint ───────────────────────────────────────────────────────────
alter table public.brand_blueprint enable row level security;

drop policy if exists "brand_blueprint: owner access" on public.brand_blueprint;

create policy "brand_blueprint: owner access"
  on public.brand_blueprint
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

-- ── caption_history ───────────────────────────────────────────────────────────
alter table public.caption_history enable row level security;

drop policy if exists "caption_history: owner access" on public.caption_history;

create policy "caption_history: owner access"
  on public.caption_history
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

-- ── reel_script_history ───────────────────────────────────────────────────────
alter table public.reel_script_history enable row level security;

drop policy if exists "reel_script_history: owner access" on public.reel_script_history;

create policy "reel_script_history: owner access"
  on public.reel_script_history
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

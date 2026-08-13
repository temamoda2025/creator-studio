-- User-saved custom Design Creator templates
-- Stores a brand's exact configuration (colours, fonts, layout, text style) as a
-- reusable personal template, shown in the "My Templates" row.

create table if not exists public.custom_templates (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null references public.brands (id) on delete cascade,
  name        text not null,
  config      jsonb not null,
  created_at  timestamptz not null default now()
);

alter table public.custom_templates enable row level security;

create policy "custom_templates: owner access"
  on public.custom_templates
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

create index custom_templates_brand_id_idx on public.custom_templates (brand_id, created_at desc);

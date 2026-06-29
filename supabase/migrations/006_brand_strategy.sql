-- Brand Strategy — StoryBrand (SB7) framework fields
-- Adds 13 optional columns to brands. All nullable so existing rows are unaffected.

alter table public.brands
  add column if not exists hero_description        text,
  add column if not exists external_problem        text,
  add column if not exists internal_problem        text,
  add column if not exists philosophical_problem   text,
  add column if not exists guide_role              text,
  add column if not exists three_step_plan         jsonb,   -- [string, string, string]
  add column if not exists direct_cta              text,
  add column if not exists transitional_cta        text,
  add column if not exists stakes                  text,
  add column if not exists transformation          text,
  add column if not exists content_pillars         jsonb,   -- string[]
  add column if not exists storytelling_angle      text,
  add column if not exists posting_cadence         text;

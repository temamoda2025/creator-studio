-- Multiple target audience segments per brand
-- Adds an optional jsonb column to brands holding up to 3 audience segments,
-- e.g. [{"label": "B2C Consumers", "description": "Women 30-50 who..."}, ...]
-- The existing target_audience text column is kept as the general/default
-- audience description; audience_segments lets a brand define distinct
-- segments (e.g. B2C consumers AND B2B corporates) that content generation
-- can be targeted at individually.

alter table public.brands
  add column if not exists audience_segments jsonb not null default '[]'::jsonb;

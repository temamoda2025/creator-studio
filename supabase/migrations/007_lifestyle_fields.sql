-- Brand Journey: personal & lifestyle fields
-- Adds 3 optional jsonb columns to brands for use in the Journey content planner.

alter table public.brands
  add column if not exists personal_quotes  jsonb,  -- string[] — quotes the brand lives by
  add column if not exists lifestyle_topics jsonb,  -- string[] — personal lifestyle themes
  add column if not exists bts_topics       jsonb;  -- string[] — behind-the-scenes topics

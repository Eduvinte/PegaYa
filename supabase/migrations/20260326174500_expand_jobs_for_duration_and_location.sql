-- Add richer job fields for filtering and hiring flow.
-- Region/comuna for location filters.
-- Duration and extension information for contract clarity.

alter table public.jobs
  add column if not exists region text,
  add column if not exists comuna text,
  add column if not exists duration_value int,
  add column if not exists duration_unit text,
  add column if not exists extension_possible boolean default false;

alter table public.jobs
  drop constraint if exists jobs_duration_value_check;

alter table public.jobs
  add constraint jobs_duration_value_check
  check (duration_value is null or duration_value > 0);

alter table public.jobs
  drop constraint if exists jobs_duration_unit_check;

alter table public.jobs
  add constraint jobs_duration_unit_check
  check (
    duration_unit is null
    or duration_unit in ('days', 'weeks', 'months', 'years')
  );

create index if not exists idx_jobs_region on public.jobs(region);
create index if not exists idx_jobs_comuna on public.jobs(comuna);
create index if not exists idx_jobs_duration on public.jobs(duration_unit, duration_value);

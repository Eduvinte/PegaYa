-- Explicit work date for vacancy lifecycle and UI action gating.
-- Replaces indirect expiry calculations from created_at + duration.

alter table public.jobs
  add column if not exists work_start_date date;

update public.jobs
set work_start_date = coalesce(
  work_start_date,
  case
    when duration_value is not null and duration_unit = 'days'
      then (created_at::date + duration_value)
    when duration_value is not null and duration_unit = 'weeks'
      then (created_at::date + (duration_value * 7))
    when duration_value is not null and duration_unit = 'months'
      then (created_at::date + make_interval(months => duration_value))::date
    when duration_value is not null and duration_unit = 'years'
      then (created_at::date + make_interval(years => duration_value))::date
    else created_at::date
  end
);

alter table public.jobs
  alter column work_start_date set not null;

alter table public.jobs
  alter column work_start_date set default current_date;

create index if not exists idx_jobs_work_start_date on public.jobs(work_start_date);

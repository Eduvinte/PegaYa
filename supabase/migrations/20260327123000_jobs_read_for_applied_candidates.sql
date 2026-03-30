-- Let candidates read job details for jobs they applied to.
-- This keeps application history understandable even when the vacancy is closed.

create policy "jobs: read applied candidate"
on public.jobs
for select
using (
  exists (
    select 1
    from public.applications a
    where a.job_id = jobs.id
      and a.user_id = auth.uid()
  )
);

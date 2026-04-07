-- Fix recursion between jobs/applications RLS policies.
-- Previous policy "jobs: read applied candidate" queried public.applications directly,
-- while applications policy also queries jobs, causing infinite recursion.

create or replace function public.has_applied_to_job(target_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.applications a
    where a.job_id = target_job_id
      and a.user_id = auth.uid()
  );
$$;

revoke all on function public.has_applied_to_job(uuid) from public;
grant execute on function public.has_applied_to_job(uuid) to anon, authenticated;

drop policy if exists "jobs: read applied candidate" on public.jobs;
create policy "jobs: read applied candidate"
on public.jobs
for select
using (
  auth.uid() is not null
  and public.has_applied_to_job(id)
);

-- Expose real application counts per job without leaking non-readable jobs.
-- Uses SECURITY DEFINER and explicit visibility checks aligned with jobs policies.

create or replace function public.get_job_application_counts(job_ids uuid[])
returns table(job_id uuid, total_applications bigint)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    j.id as job_id,
    count(a.id)::bigint as total_applications
  from unnest(job_ids) as input(job_id)
  join public.jobs j on j.id = input.job_id
  left join public.applications a on a.job_id = j.id
  where
    j.status = 'open'
    or (
      auth.uid() is not null
      and exists (
        select 1
        from public.companies c
        where c.id = j.company_id
          and c.owner_id = auth.uid()
      )
    )
    or (
      auth.uid() is not null
      and public.has_applied_to_job(j.id)
    )
  group by j.id;
$$;

revoke all on function public.get_job_application_counts(uuid[]) from public;
grant execute on function public.get_job_application_counts(uuid[]) to anon, authenticated;

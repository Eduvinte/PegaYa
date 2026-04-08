-- Auto-close job when a candidate is selected.
-- Auto-reopen job when a previously selected candidate desists.

create or replace function public.sync_job_status_from_application_selection()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_job_id uuid := coalesce(new.job_id, old.job_id);
  v_new_status text := coalesce(new.status, '');
  v_old_status text := coalesce(old.status, '');
  v_has_active_selection boolean;
begin
  if v_job_id is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'UPDATE' and v_new_status = v_old_status then
    return new;
  end if;

  -- Any active selection should keep the job closed.
  if v_new_status in ('selected_by_company', 'accepted_by_candidate', 'accepted') then
    update public.jobs
    set status = 'closed'
    where id = v_job_id
      and status <> 'closed';

    return new;
  end if;

  -- If we leave an active-selection state, reopen only when no active selections remain.
  if tg_op = 'UPDATE'
     and v_old_status in ('selected_by_company', 'accepted_by_candidate', 'accepted')
     and v_new_status not in ('selected_by_company', 'accepted_by_candidate', 'accepted') then
    select exists (
      select 1
      from public.applications a
      where a.job_id = v_job_id
        and a.status in ('selected_by_company', 'accepted_by_candidate', 'accepted')
    )
    into v_has_active_selection;

    if not v_has_active_selection then
      update public.jobs
      set status = 'open'
      where id = v_job_id
        and status = 'closed';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_application_selection_sync_job_status on public.applications;
create trigger on_application_selection_sync_job_status
after insert or update of status on public.applications
for each row execute function public.sync_job_status_from_application_selection();

-- Backfill: if there are already selected candidates in open jobs, close those jobs.
update public.jobs j
set status = 'closed'
where j.status = 'open'
  and exists (
    select 1
    from public.applications a
    where a.job_id = j.id
      and a.status in ('selected_by_company', 'accepted_by_candidate', 'accepted')
  );

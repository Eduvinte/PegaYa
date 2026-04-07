-- Notify company owner when a candidate applies to one of their jobs.

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'application_received',
      'application_selected',
      'application_accepted',
      'job_closed',
      'message_received',
      'system'
    )
  );

create or replace function public.notify_application_created()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner_id uuid;
  v_job_title text;
  v_candidate_name text;
begin
  select c.owner_id, j.title
    into v_owner_id, v_job_title
  from public.jobs j
  join public.companies c on c.id = j.company_id
  where j.id = new.job_id
  limit 1;

  if v_owner_id is null then
    return new;
  end if;

  select p.full_name
    into v_candidate_name
  from public.profiles p
  where p.id = new.user_id
  limit 1;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    entity_type,
    entity_id
  ) values (
    v_owner_id,
    new.user_id,
    'application_received',
    'Nueva postulacion recibida',
    coalesce(v_candidate_name, 'Un candidato') || ' postulo a "' || coalesce(v_job_title, 'tu vacante') || '".',
    'job',
    new.job_id
  );

  return new;
end;
$$;

drop trigger if exists on_application_created_notify on public.applications;
create trigger on_application_created_notify
after insert on public.applications
for each row execute function public.notify_application_created();

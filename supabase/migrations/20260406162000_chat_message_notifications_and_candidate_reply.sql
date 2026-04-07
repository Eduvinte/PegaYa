-- Chat phase 2:
-- 1) Candidate can reply only after company sends first message.
-- 2) Every new message creates notifications for the other participants.

create or replace function public.conversation_has_company_message(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.messages m
    join public.users u on u.id = m.sender_id
    where m.conversation_id = target_conversation_id
      and u.role = 'company'
  );
$$;

revoke all on function public.conversation_has_company_message(uuid) from public;
grant execute on function public.conversation_has_company_message(uuid) to anon, authenticated;

drop policy if exists "messages: insert company only" on public.messages;
create policy "messages: insert with candidate reply rule"
on public.messages
for insert
with check (
  auth.uid() = sender_id
  and public.is_conversation_member(conversation_id)
  and (
    public.is_company_user()
    or public.conversation_has_company_message(conversation_id)
  )
);

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'application_selected',
      'application_accepted',
      'job_closed',
      'message_received',
      'system'
    )
  );

create or replace function public.notify_conversation_message()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    entity_type,
    entity_id
  )
  select
    cp.user_id,
    new.sender_id,
    'message_received',
    'Nuevo mensaje',
    left(coalesce(new.content, ''), 180),
    'conversation',
    new.conversation_id
  from public.conversation_participants cp
  where cp.conversation_id = new.conversation_id
    and cp.user_id <> new.sender_id;

  return new;
end;
$$;

drop trigger if exists on_message_created_notify on public.messages;
create trigger on_message_created_notify
after insert on public.messages
for each row execute function public.notify_conversation_message();

-- Harden chat role checks with SECURITY DEFINER helper.
-- This avoids policy failures caused by cross-table RLS evaluation on public.users.

create or replace function public.is_company_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'company'
  );
$$;

revoke all on function public.is_company_user() from public;
grant execute on function public.is_company_user() to anon, authenticated;

drop policy if exists "conversations: insert company only" on public.conversations;
create policy "conversations: insert company only"
on public.conversations
for insert
with check (
  auth.uid() is not null
  and public.is_company_user()
);

drop policy if exists "participants: insert candidate by company" on public.conversation_participants;
create policy "participants: insert candidate by company"
on public.conversation_participants
for insert
with check (
  auth.uid() <> user_id
  and public.is_company_user()
  and exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.companies c on c.id = j.company_id
    where c.owner_id = auth.uid()
      and a.user_id = conversation_participants.user_id
  )
);

drop policy if exists "messages: insert company only" on public.messages;
create policy "messages: insert company only"
on public.messages
for insert
with check (
  auth.uid() = sender_id
  and public.is_company_user()
  and exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

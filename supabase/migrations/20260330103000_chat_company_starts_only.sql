-- Chat phase 1:
-- 1) Only company users can create conversations.
-- 2) Company can add participants (self + candidate related to their jobs).
-- 3) Only company can send messages.
-- 4) Participants can read all participants in conversations they belong to.

drop policy if exists "conversations: insert" on public.conversations;
create policy "conversations: insert company only"
on public.conversations
for insert
with check (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'company'
  )
);

drop policy if exists "participants: read own" on public.conversation_participants;
create policy "participants: read conversation"
on public.conversation_participants
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  )
);

create policy "participants: insert own"
on public.conversation_participants
for insert
with check (auth.uid() = user_id);

create policy "participants: insert candidate by company"
on public.conversation_participants
for insert
with check (
  auth.uid() <> user_id
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'company'
  )
  and exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.companies c on c.id = j.company_id
    where c.owner_id = auth.uid()
      and a.user_id = conversation_participants.user_id
  )
);

drop policy if exists "messages: insert" on public.messages;
create policy "messages: insert company only"
on public.messages
for insert
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'company'
  )
  and exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

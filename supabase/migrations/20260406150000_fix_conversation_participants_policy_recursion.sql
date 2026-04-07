-- Fix recursion in conversation_participants RLS.
-- Previous select policy queried the same table directly inside USING,
-- which causes "infinite recursion detected in policy".

create or replace function public.is_conversation_member(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = target_conversation_id
      and cp.user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to anon, authenticated;

drop policy if exists "participants: read conversation" on public.conversation_participants;
create policy "participants: read conversation"
on public.conversation_participants
for select
using (
  auth.uid() = user_id
  or public.is_conversation_member(conversation_id)
);

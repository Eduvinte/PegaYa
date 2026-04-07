-- Allow company participants to set/update job context in a conversation.
-- Job must belong to the company owner.

create policy "conversations: update company context"
on public.conversations
for update
using (
  public.is_company_user()
  and public.is_conversation_member(id)
)
with check (
  public.is_company_user()
  and public.is_conversation_member(id)
  and (
    job_id is null
    or exists (
      select 1
      from public.jobs j
      join public.companies c on c.id = j.company_id
      where j.id = conversations.job_id
        and c.owner_id = auth.uid()
    )
  )
);

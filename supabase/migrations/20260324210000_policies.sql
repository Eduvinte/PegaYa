-- USERS
create policy "users: read own"
on public.users
for select
using (auth.uid() = id);

-- PROFILES
create policy "profiles: public read"
on public.profiles
for select
using (true);

create policy "profiles: insert own"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles: update own"
on public.profiles
for update
using (auth.uid() = id);

-- COMPANIES
create policy "companies: public read"
on public.companies
for select
using (true);

create policy "companies: insert"
on public.companies
for insert
with check (auth.uid() = owner_id);

create policy "companies: update own"
on public.companies
for update
using (auth.uid() = owner_id);

-- JOBS
create policy "jobs: public read"
on public.jobs
for select
using (status = 'open');

create policy "jobs: insert"
on public.jobs
for insert
with check (
  exists (
    select 1 from public.companies
    where id = company_id
    and owner_id = auth.uid()
  )
);

create policy "jobs: update own"
on public.jobs
for update
using (
  exists (
    select 1 from public.companies
    where id = company_id
    and owner_id = auth.uid()
  )
);

-- APPLICATIONS
create policy "applications: read"
on public.applications
for select
using (
  auth.uid() = user_id
  OR
  exists (
    select 1 from public.jobs j
    join public.companies c on j.company_id = c.id
    where j.id = job_id
    and c.owner_id = auth.uid()
  )
);

create policy "applications: insert"
on public.applications
for insert
with check (auth.uid() = user_id);

create policy "applications: update by company"
on public.applications
for update
using (
  exists (
    select 1 from public.jobs j
    join public.companies c on j.company_id = c.id
    where j.id = job_id
    and c.owner_id = auth.uid()
  )
);

-- REVIEWS
create policy "reviews: public read"
on public.reviews
for select
using (true);

create policy "reviews: insert"
on public.reviews
for insert
with check (auth.uid() = reviewer_id);

-- CHAT: PARTICIPANTS
create policy "participants: read own"
on public.conversation_participants
for select
using (auth.uid() = user_id);

-- CHAT: CONVERSATIONS
create policy "conversations: read"
on public.conversations
for select
using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversations.id
    and cp.user_id = auth.uid()
  )
);

create policy "conversations: insert"
on public.conversations
for insert
with check (auth.uid() is not null);

-- CHAT: MESSAGES
create policy "messages: read"
on public.messages
for select
using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
    and cp.user_id = auth.uid()
  )
);

create policy "messages: insert"
on public.messages
for insert
with check (
  auth.uid() = sender_id
  AND
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
    and cp.user_id = auth.uid()
  )
);

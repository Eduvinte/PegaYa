-- Hiring workflow + notifications:
-- company selects candidate -> candidate accepts -> company closes vacancy

-- 1) Expand applications status flow
alter table public.applications
  drop constraint if exists applications_status_check;

alter table public.applications
  add constraint applications_status_check
  check (status in ('pending', 'selected_by_company', 'accepted_by_candidate', 'rejected'));

-- 2) Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.users(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  type text not null
    check (type in ('application_selected', 'application_accepted', 'job_closed', 'system')),
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamp,
  created_at timestamp default now()
);

create index if not exists idx_notifications_recipient_created
  on public.notifications(recipient_id, created_at desc);

create index if not exists idx_notifications_unread
  on public.notifications(recipient_id, read_at)
  where read_at is null;

alter table public.notifications enable row level security;

-- 3) Jobs policies needed for company lifecycle
create policy "jobs: read own company"
on public.jobs
for select
using (
  exists (
    select 1
    from public.companies c
    where c.id = jobs.company_id
      and c.owner_id = auth.uid()
  )
);

drop policy if exists "jobs: update own" on public.jobs;
create policy "jobs: update own"
on public.jobs
for update
using (
  exists (
    select 1
    from public.companies c
    where c.id = jobs.company_id
      and c.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.companies c
    where c.id = jobs.company_id
      and c.owner_id = auth.uid()
  )
);

create policy "jobs: delete own"
on public.jobs
for delete
using (
  exists (
    select 1
    from public.companies c
    where c.id = jobs.company_id
      and c.owner_id = auth.uid()
  )
);

-- 4) Candidate can respond to selection
create policy "applications: update own response"
on public.applications
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and status in ('accepted_by_candidate', 'rejected')
);

-- 5) Notification policies
create policy "notifications: read own"
on public.notifications
for select
using (recipient_id = auth.uid());

create policy "notifications: insert actor"
on public.notifications
for insert
with check (
  auth.uid() is not null
  and (actor_id is null or actor_id = auth.uid())
);

create policy "notifications: mark own read"
on public.notifications
for update
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

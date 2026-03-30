-- Restrict reviews to users who actually participated in a completed hiring relation.
-- Allows:
-- 1) company owner reviewing candidate
-- 2) candidate reviewing company owner
-- only when application status is accepted/closed in workflow.

drop policy if exists "reviews: insert" on public.reviews;

create policy "reviews: insert after relation"
on public.reviews
for insert
with check (
  reviewer_id = auth.uid()
  and reviewed_user_id <> auth.uid()
  and exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.companies c on c.id = j.company_id
    where a.status in ('accepted_by_candidate', 'accepted')
      and (
        (auth.uid() = c.owner_id and reviewed_user_id = a.user_id)
        or
        (auth.uid() = a.user_id and reviewed_user_id = c.owner_id)
      )
  )
);

-- Add job context to chat conversations so users know which vacancy the chat belongs to.

alter table public.conversations
  add column if not exists job_id uuid references public.jobs(id) on delete set null;

create index if not exists idx_conversations_job_id
  on public.conversations(job_id);

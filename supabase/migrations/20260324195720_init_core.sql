-- USERS (extiende auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('candidate', 'company')) not null,
  created_at timestamp default now()
);

-- PROFILES (info pública)
create table public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  rating numeric default 0,
  verified boolean default false
);

-- COMPANIES
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id),
  name text not null,
  description text,
  verified boolean default false,
  created_at timestamp default now()
);

-- JOBS
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  title text not null,
  description text,
  location text,
  salary numeric,
  status text check (status in ('open', 'closed')) default 'open',
  created_at timestamp default now()
);

-- APPLICATIONS
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp default now(),
  unique(user_id, job_id)
);

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references public.users(id),
  reviewed_user_id uuid references public.users(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamp default now()
);

-- CHAT (conversaciones)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now()
);

-- PARTICIPANTES CHAT
create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  primary key (conversation_id, user_id)
);

-- MENSAJES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.users(id),
  content text,
  created_at timestamp default now()
);
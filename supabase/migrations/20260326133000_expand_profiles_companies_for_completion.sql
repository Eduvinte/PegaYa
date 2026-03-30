-- Expand candidate/company profile fields for richer onboarding and profile completion.

alter table public.profiles
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists nationality text,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists headline text,
  add column if not exists education_level text,
  add column if not exists years_experience int default 0,
  add column if not exists skills text[] default '{}',
  add column if not exists linkedin_url text,
  add column if not exists portfolio_url text,
  add column if not exists cv_url text,
  add column if not exists availability text;

alter table public.profiles
  drop constraint if exists profiles_years_experience_check;

alter table public.profiles
  add constraint profiles_years_experience_check check (years_experience >= 0);

alter table public.companies
  add column if not exists website text,
  add column if not exists industry text,
  add column if not exists company_size text,
  add column if not exists founded_year int,
  add column if not exists hq_city text,
  add column if not exists hq_region text;

alter table public.companies
  drop constraint if exists companies_founded_year_check;

alter table public.companies
  add constraint companies_founded_year_check check (
    founded_year is null
    or (founded_year >= 1800 and founded_year <= extract(year from now())::int)
  );

create index if not exists idx_reviews_reviewed_user_id on public.reviews(reviewed_user_id);

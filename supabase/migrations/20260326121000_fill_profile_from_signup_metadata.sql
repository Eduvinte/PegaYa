-- Fill public.profiles with basic user information from auth metadata at signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  incoming_role text;
  incoming_full_name text;
  incoming_bio text;
begin
  incoming_role := coalesce(new.raw_user_meta_data ->> 'role', 'candidate');
  incoming_full_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  incoming_bio := nullif(trim(coalesce(new.raw_user_meta_data ->> 'bio', '')), '');

  if incoming_role not in ('candidate', 'company') then
    incoming_role := 'candidate';
  end if;

  insert into public.users (id, role)
  values (new.id, incoming_role);

  insert into public.profiles (id, full_name, bio)
  values (new.id, incoming_full_name, incoming_bio);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Backfill missing profile fields from metadata for existing users.
update public.profiles p
set
  full_name = coalesce(
    nullif(trim(au.raw_user_meta_data ->> 'full_name'), ''),
    p.full_name
  ),
  bio = coalesce(
    nullif(trim(au.raw_user_meta_data ->> 'bio'), ''),
    p.bio
  )
from auth.users au
where au.id = p.id
  and (
    p.full_name is null
    or p.bio is null
  );

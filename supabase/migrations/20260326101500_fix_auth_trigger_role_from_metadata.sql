-- Ensure new users get the role selected at signup from auth metadata.
-- Falls back to 'candidate' when metadata is missing/invalid.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  incoming_role text;
begin
  incoming_role := coalesce(new.raw_user_meta_data ->> 'role', 'candidate');

  if incoming_role not in ('candidate', 'company') then
    incoming_role := 'candidate';
  end if;

  insert into public.users (id, role)
  values (new.id, incoming_role);

  insert into public.profiles (id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Optional backfill for existing records created before this fix.
update public.users u
set role = case
  when (au.raw_user_meta_data ->> 'role') in ('candidate', 'company')
    then (au.raw_user_meta_data ->> 'role')
  else u.role
end
from auth.users au
where au.id = u.id
  and (au.raw_user_meta_data ->> 'role') in ('candidate', 'company')
  and u.role is distinct from (au.raw_user_meta_data ->> 'role');

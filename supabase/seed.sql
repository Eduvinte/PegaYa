-- Local seed data for Supabase reset.
-- Run automatically with: supabase db reset --seed

begin;

-- Fixed ids so references stay stable.
-- candidate: ana@pegaya.local / Passw0rd!123
-- company: empresa@pegaya.local / Passw0rd!123
insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'authenticated',
    'authenticated',
    'ana@pegaya.local',
    crypt('Passw0rd!123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"candidate"}'::jsonb,
    now(),
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'authenticated',
    'authenticated',
    'empresa@pegaya.local',
    crypt('Passw0rd!123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"company"}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

-- Trigger handle_new_user already creates public.users + public.profiles.
-- Enrich profile data.
update public.profiles
set
  full_name = 'Ana Soto',
  bio = 'Candidata disponible para turnos y proyectos temporales.',
  verified = true
where id = '11111111-1111-1111-1111-111111111111'::uuid;

update public.profiles
set
  full_name = 'Equipo Operaciones Pegaya',
  bio = 'Perfil operador de empresa para publicacion de vacantes.',
  verified = true
where id = '22222222-2222-2222-2222-222222222222'::uuid;

-- Company owned by the company user.
insert into public.companies (id, owner_id, name, description, verified, created_at)
values (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Pegaya Operaciones SpA',
  'Empresa ejemplo para flujo local de vacantes en Chile.',
  true,
  now()
)
on conflict (id) do nothing;

-- Jobs for feed and detail tests.
insert into public.jobs (id, company_id, title, description, location, salary, status, created_at, work_start_date)
values
  (
    '44444444-4444-4444-4444-444444444441'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Operario de bodega - turno dia',
    'Recepcion de mercaderia, picking y control de inventario. Inicio inmediato.',
    'Santiago',
    650000,
    'open',
    now() - interval '1 day',
    (now() + interval '6 days')::date
  ),
  (
    '44444444-4444-4444-4444-444444444442'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Asistente administrativo',
    'Apoyo documental, gestion de correos y coordinacion interna.',
    'Valparaiso',
    720000,
    'open',
    now() - interval '2 days',
    (now() + interval '12 days')::date
  ),
  (
    '44444444-4444-4444-4444-444444444443'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Tecnico soporte terreno',
    'Atencion de incidencias en terreno para clientes corporativos.',
    'Concepcion',
    900000,
    'closed',
    now() - interval '7 days',
    (now() - interval '1 day')::date
  )
on conflict (id) do nothing;

-- Candidate already applied to one job.
insert into public.applications (id, user_id, job_id, status, created_at)
values (
  '55555555-5555-5555-5555-555555555551'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '44444444-4444-4444-4444-444444444441'::uuid,
  'pending',
  now() - interval '12 hours'
)
on conflict (id) do nothing;

commit;

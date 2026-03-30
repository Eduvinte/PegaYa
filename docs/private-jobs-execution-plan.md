# Private Jobs Plan (App Interna)

Date: 2026-03-26

## Objetivo

Implementar el area privada de la app con foco en:
- menu lateral expandible
- avatar + datos del usuario
- opciones por rol (`candidate` / `company`)
- feed principal de vacantes con cards
- detalle de vacante + postulacion
- vista "Mis postulaciones" para candidato
- vista de perfil para candidato y empresa

## Alcance V1

### Incluye

1. App shell privada con sidebar responsive (desktop fijo + drawer en mobile).
2. Home privada en `/jobs` como feed de vacantes.
3. Cards de vacante con:
   - `title`
   - `description` corta
   - `status`
   - `applications_count`
   - CTA `Ver detalle`
4. Detalle de vacante en `/jobs/[jobId]` con CTA `Postular`.
5. Menu por rol:
   - `candidate`: Jobs, Mis postulaciones, Mi perfil
   - `company`: Jobs, Publicar vacante, Mis vacantes, Perfil empresa
6. Logout visible en sidebar.

### No incluye (V1)

1. Chat interno desde detalle de vacante.
2. Moderacion admin.
3. Analytics avanzadas.
4. Sistema de notificaciones realtime.

## Riesgos/Gaps detectados (antes de implementar)

1. RLS actual de `jobs` deja leer solo `status = 'open'`.
   - Riesgo: empresa no vera sus vacantes cerradas en "Mis vacantes".
   - Accion: agregar policy extra para que owner vea todos sus jobs.
2. Filtro "rango temporal" no tiene columna dedicada en `jobs`.
   - Accion recomendada: migration para `contract_type` o `duration_type`.
3. Conteo de postulaciones por job:
   - Con RLS puede variar por rol.
   - Accion: definir query agregada controlada (vista/RPC o join con `applications` segun permisos).

## Arquitectura propuesta

## Rutas (app router)

- `src/app/(app)/layout.tsx` -> layout privado con sidebar
- `src/app/(app)/jobs/page.tsx` -> feed principal
- `src/app/(app)/jobs/[jobId]/page.tsx` -> detalle vacante
- `src/app/(app)/applications/page.tsx` -> mis postulaciones (candidate)
- `src/app/(app)/company/jobs/page.tsx` -> mis vacantes (company)
- `src/app/(app)/company/jobs/new/page.tsx` -> publicar vacante (company)
- `src/app/(app)/profile/page.tsx` -> perfil candidato
- `src/app/(app)/company/profile/page.tsx` -> perfil empresa

## Features (screaming architecture)

- `src/features/app-shell/*`
- `src/features/jobs/feed/*`
- `src/features/jobs/detail/*`
- `src/features/jobs/publish/*`
- `src/features/applications/list/*`
- `src/features/profile/candidate/*`
- `src/features/profile/company/*`

## Shared UI a crear/reusar

1. `Sidebar` (expand/collapse + mobile drawer)
2. `Avatar` (fallback con iniciales)
3. `JobCard`
4. `EmptyState`
5. `Skeleton` (si no existe, agregar en Fase 4 del plan general)
6. Reusar `Button`, `Card`, `Input` actuales

## Plan por fases

## Fase A - App shell + auth context (prioridad alta)

### Tareas

1. Crear layout privado con sidebar.
2. Leer usuario autenticado server-side.
3. Cargar `users.role` + `profiles.avatar_url` para pintar menu/avatar.
4. Implementar colapso sidebar (desktop) y drawer (mobile).
5. Navegacion role-based.

### Done

1. Sidebar funciona en desktop/mobile.
2. Opciones cambian por rol sin hardcode en frontend.
3. Logout visible y operativo.

## Fase B - Feed de jobs (prioridad alta)

### Tareas

1. Query de jobs abiertos para feed principal.
2. Construir `JobCard` con estado + count postulaciones.
3. Filtros base V1 (location + status; temporal sujeto a migration).
4. Estados UI: loading/empty/error.

### Done

1. `/jobs` usable en mobile/desktop.
2. Cards con jerarquia clara y CTA a detalle.
3. Sin romper RLS.

## Fase C - Detalle + postular (prioridad alta)

### Tareas

1. Crear `/jobs/[jobId]`.
2. Mostrar datos completos de vacante.
3. Boton `Postular` para candidate.
4. Manejar error de unique `(user_id, job_id)` con mensaje claro.

### Done

1. Candidate puede postular una vez.
2. Company no puede postular a su propia vacante (regla en UI + validacion).

## Fase D - Role modules (prioridad media-alta)

### Tareas company

1. Publicar vacante (`/company/jobs/new`).
2. Ver y editar "Mis vacantes" (`/company/jobs`).
3. Perfil empresa (`/company/profile`).

### Tareas candidate

1. Ver "Mis postulaciones" (`/applications`).
2. Perfil candidato (`/profile`).

### Done

1. Menu muestra solo items relevantes por rol.
2. Flujos de company y candidate separados y claros.

## Fase E - Hardening (prioridad alta)

### Tareas

1. Ajustar migrations/policies faltantes para V1.
2. Tests smoke de rutas privadas.
3. QA responsive y accesibilidad basica.

### Done

1. RLS validado para lecturas/escrituras criticas.
2. Sin regresiones en login/logout/reset.

## Backlog SQL recomendado (antes o durante Fase D)

1. Policy: `jobs: read own company` (owner puede ver sus jobs abiertos/cerrados).
2. (Opcional V1.1) migration en `jobs`:
   - `contract_type text check (...)`
   - `duration_type text check (...)`
3. (Opcional) vista/RPC para conteo de postulaciones por job optimizado.

## Orden de ejecucion recomendado

1. Fase A
2. Fase B
3. Fase C
4. Fase D
5. Fase E

## Estado

- Fase A: `COMPLETADA`
- Fase B: `COMPLETADA (V1 base)`
- Fase C: `COMPLETADA (V1 base)`
- Fase D: `EN CURSO`
- Fase E: `PENDIENTE`

## Avance implementado (2026-03-26)

1. App shell privada lista:
   - `src/app/(app)/layout.tsx`
   - `src/features/app-shell/components/AppShell.tsx`
   - `src/features/app-shell/services/getCurrentAppUser.ts`
2. Feed jobs:
   - `src/app/(app)/jobs/page.tsx`
   - `src/features/jobs/feed/*`
3. Detalle + postulacion:
   - `src/app/(app)/jobs/[jobId]/page.tsx`
   - `src/features/jobs/detail/*`
4. Role modules base:
   - Candidate:
     - `src/app/(app)/applications/page.tsx`
     - `src/app/(app)/profile/page.tsx`
   - Company:
     - `src/app/(app)/company/jobs/page.tsx`
     - `src/app/(app)/company/jobs/new/page.tsx`
     - `src/app/(app)/company/profile/page.tsx`
     - `src/app/(app)/company/onboarding/page.tsx`
5. Middleware privado actualizado:
   - `src/middleware.ts` ahora cubre `/jobs`, `/applications`, `/profile`, `/company`.

## Pendiente inmediato (siguiente bloque)

1. Ajustar policy para que empresa vea sus vacantes cerradas en "Mis vacantes".
2. Mejorar filtros reales del feed (`location`, `status`, `duration_type` cuando exista migration).
3. Crear pantallas de edicion (perfil candidato, perfil empresa, editar vacante).
4. Agregar skeleton/loading por vista y tests smoke privados.

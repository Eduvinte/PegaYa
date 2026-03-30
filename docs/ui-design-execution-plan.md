# UI Design Execution Plan (Chile)

Date: 2026-03-26

## Objetivo

Definir y ejecutar el diseño de la app sin perder foco mientras crece la lógica de negocio.

Alcance inicial:
- Home pública
- Login
- Registro
- Recuperar clave
- Reset clave
- Base reusable de componentes globales

## Reglas de trabajo

1. No tocar lógica de negocio al diseñar (solo UI/UX).
2. No hardcodear colores en páginas: usar tokens globales.
3. Todo componente nuevo reutilizable va en `src/shared/ui`.
4. Cada fase se cierra solo con criterios de “Done” cumplidos.
5. Copy orientado a Chile: lenguaje local para empleo y vacantes.

## Base visual (ya creada)

- Tokens globales y glass effects en `src/app/globals.css`.
- Componentes base en `src/shared/ui`:
  - `Button`
  - `Input`
  - `Card`
  - `Modal`
- Página demo general: `src/app/ui-kit/page.tsx`.

## Estado actual (2026-03-26)

- Fase 1: `COMPLETADA`
  - Home publica responsive con hero, CTAs, overlays y particulas.
- Fase 2: `COMPLETADA`
  - Login, signup, forgot-password y reset-password con patron visual unificado y responsive.
- Footer global: `COMPLETADO`
  - `AppFooter` reusable en `src/shared/ui/footer/Footer.tsx`.
  - Integrado en `src/app/layout.tsx` para todas las paginas.
- Fase 3: `EN CURSO`
  - Plan detallado en `docs/private-jobs-execution-plan.md`.
  - Ya implementado: shell privada, sidebar por rol, feed `/jobs`, detalle `/jobs/[jobId]`, base de modulos por rol.
- Fase 4: `PENDIENTE`
- Fase 5: `PENDIENTE`

## Fase 1: Home pública (prioridad alta)

### Entregables

- Hero con `public/banner1.jpg` como fondo principal.
- Overlay con contraste para legibilidad.
- CTA claros:
  - “Buscar vacantes”
  - “Publicar vacante”
- Bloques de valor para Chile:
  - Vacantes por día, proyectos de meses, posiciones estables.
  - Empresas y postulantes.
- Sección de categorías rápidas (ejemplo: retail, logística, tecnología, salud, minería, construcción).
- Componente de partículas de luz suave (no invasivo).

### Done

- Home responsive (mobile/tablet/desktop).
- Contraste AA mínimo en textos principales.
- Performance visual estable (sin caída notable de FPS en equipos normales).
- Sin strings en inglés en Home.

## Fase 2: Auth pages (prioridad alta)

Páginas:
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`

### Entregables

- Layout visual consistente con Home.
- Uso de `Card + Input + Button` globales.
- Estados visuales claros:
  - loading
  - error
  - success
- Textos localizados para Chile.

### Done

- Flujos funcionales existentes se mantienen.
- Sin duplicación de estilos por página.
- Mismo patrón visual entre las 4 páginas.

## Fase 3: Jobs privada (prioridad media-alta)

Página:
- `/jobs`

### Entregables

- Header privado + botón de logout.
- Feed de vacantes con cards glass.
- Filtros visuales base:
  - ubicación
  - tipo de jornada
  - rango temporal (1 día / temporal / indefinido)
- Empty state y skeleton.

### Done

- Página usable en mobile.
- Jerarquía visual clara para leer vacantes rápido.
- Accesos principales visibles sin scroll extremo.

## Fase 4: Componentes globales v2 (prioridad media)

### Nuevos componentes

- `Select`
- `Textarea`
- `Badge` (estado vacante: abierta/cerrada)
- `Tabs`
- `Skeleton`
- `Toast theme` alineado al sistema visual

### Done

- Todos con variantes y props documentadas.
- Ejemplos agregados en `src/app/ui-kit/page.tsx`.

## Fase 5: QA visual y accesibilidad (prioridad alta)

### Checklist final

- Navegación teclado (focus visible).
- Labels y `aria-*` en formularios.
- Revisar tamaños de fuente mínimos.
- Revisar cortes en móviles de 360px.
- Revisar dark-only artifacts (glass demasiado opaco/transparente).

### Done

- No regressions visuales en auth.
- No textos superpuestos o truncados críticos.
- UI Kit y páginas productivas alineadas.

## Orden sugerido de implementación

1. Fase 1 (Home)
2. Fase 2 (Auth)
3. Fase 3 (Jobs privada)
4. Fase 4 (UI global v2)
5. Fase 5 (QA)

## Control de avance (para no perderse)

Usar este estado por fase:
- `PENDIENTE`
- `EN CURSO`
- `BLOQUEADA`
- `LISTA PARA QA`
- `COMPLETADA`

Registrar al cierre de cada fase:
- Qué se entregó
- Qué quedó fuera
- Riesgos detectados
- Próximo paso exacto

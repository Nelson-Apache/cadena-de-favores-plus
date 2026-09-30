---
description: Crear una propuesta de cambio OpenSpec (SDD fases 1–3)
argument-hint: <descripción del cambio>
---
Crea un change de OpenSpec para: $ARGUMENTS

Pasos:
1. Lee `openspec/project.md`, `openspec/AGENTS.md`, las specs de `openspec/specs/` y los changes activos.
2. Elige un `change-id` en kebab-case con verbo (`add-`, `update-`, `remove-`, `refactor-`) que no exista.
3. Crea `openspec/changes/<change-id>/proposal.md` con **Why**, **What Changes**, **Impact** y **Preguntas abiertas**.
4. Crea los deltas en `openspec/changes/<change-id>/specs/<capacidad>/spec.md` usando
   `## ADDED|MODIFIED|REMOVED Requirements`, requisitos con SHALL/MUST y al menos un `#### Scenario:` con WHEN/THEN.
5. Si hay decisiones técnicas (datos, seguridad, varias capas), crea `design.md`.
6. Crea `tasks.md` con tareas pequeñas y verificables, en secciones etiquetadas por responsable
   (ver `docs/06-agentes-y-delegacion.md`):
   `## 1. Dominio · backend-dev` → `## 2. Datos · backend-dev` → `## 3. UI · frontend-dev` → `## 4. Verificación · test-engineer`.
   Incluye en Verificación: pruebas de cada escenario y, si hay UI, revisión responsive 360–1440 px.
7. Crea el tablero de pendientes vacío: `node .claude/scripts/orquestacion.mjs iniciar <change-id>` seguido de
   `node .claude/scripts/orquestacion.mjs terminar` (crea `handoffs.md` sin dejar el change en curso).
8. Basa los requisitos en `docs/01-contexto-design-thinking.md`; no inventes reglas de negocio.
9. **No escribas código de la app.** Termina mostrando un resumen y pidiendo aprobación al equipo.

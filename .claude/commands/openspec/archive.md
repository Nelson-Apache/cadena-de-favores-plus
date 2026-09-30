---
description: Archivar un change OpenSpec implementado (SDD fase 6)
argument-hint: <change-id>
---
Archiva el change `$ARGUMENTS`.

Pasos:
1. Verifica con `node .claude/scripts/orquestacion.mjs siguiente $ARGUMENTS` que responda **LISTO**
   (todas las tareas `- [x]` y ningún pendiente abierto en `handoffs.md`), y que `npm run check` y `npm run build`
   pasen en `app/`. Si no, detente e informa.
2. Para cada delta en `openspec/changes/$ARGUMENTS/specs/<capacidad>/spec.md`:
   - `ADDED`: agrega los requisitos a `openspec/specs/<capacidad>/spec.md` (créalo con `# <capacidad> Specification`,
     `## Purpose` y `## Requirements` si no existe).
   - `MODIFIED`: reemplaza el requisito completo con el mismo nombre.
   - `REMOVED`: elimina el requisito.
3. Mueve la carpeta a `openspec/changes/archive/AAAA-MM-DD-$ARGUMENTS/` con la fecha de hoy.
4. Actualiza la tabla de capacidades de `openspec/project.md` y la sección "Estado actual" de `CLAUDE.md`.

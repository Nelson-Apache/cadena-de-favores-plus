# Instrucciones OpenSpec para agentes de IA

Este proyecto se desarrolla con **Spec-Driven Development (SDD)** usando la estructura de OpenSpec.
Ninguna funcionalidad se implementa sin una especificación aprobada.

## Estructura
```
openspec/
├── project.md              # Contexto, stack y convenciones (leer siempre primero)
├── AGENTS.md               # Este archivo
├── specs/                  # VERDAD ACTUAL: lo que el sistema ya hace
│   └── <capacidad>/spec.md
└── changes/                # PROPUESTAS: lo que el sistema va a hacer
    ├── <change-id>/
    │   ├── proposal.md     # Por qué y qué cambia
    │   ├── design.md       # Decisiones técnicas (opcional si es trivial)
    │   ├── tasks.md        # Checklist de implementación
    │   └── specs/<capacidad>/spec.md   # Deltas: ADDED / MODIFIED / REMOVED / RENAMED
    └── archive/YYYY-MM-DD-<change-id>/ # Changes ya aplicados
```

## Flujo (6 fases)
1. **Especificar** — Crear `changes/<change-id>/proposal.md` y los deltas de spec. `change-id` en kebab-case
   con verbo: `add-`, `update-`, `remove-`, `refactor-`.
2. **Diseñar** — `design.md` cuando hay decisiones de arquitectura, datos, seguridad o varias capas.
3. **Planear** — `tasks.md` con tareas pequeñas y verificables, en orden.
4. **Implementar** — Solo después de que el equipo apruebe la propuesta. Marcar `- [x]` cada tarea al terminarla.
5. **Verificar** — `npm run test`, `npm run build` y revisión visual contra `docs/design/stitch/`.
   Cada escenario de la spec debe poder demostrarse.
6. **Archivar** — Mover el change a `changes/archive/AAAA-MM-DD-<change-id>/` y fusionar sus deltas en `specs/`.

## Formato de specs
```markdown
# <Capacidad> Specification

## Purpose
Una o dos frases.

## Requirements
### Requirement: <Nombre>
El sistema SHALL <comportamiento verificable>.

#### Scenario: <Nombre>
- **WHEN** <condición>
- **THEN** <resultado>
- **AND** <resultado adicional>
```
Reglas:
- Todo requisito usa **SHALL/MUST** y tiene **al menos un** `#### Scenario:` (exactamente 4 almohadillas).
- En deltas usar encabezados `## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`.
- `MODIFIED` copia el requisito completo con su nuevo texto, no solo el cambio.

## Antes de escribir código
1. Leer `openspec/project.md`.
2. Revisar `specs/` y los `changes/` activos para evitar conflictos.
3. Si la petición no tiene change, **proponer uno primero** y esperar aprobación.
4. Si una regla del documento de Design Thinking es ambigua, registrarla como pregunta abierta en `proposal.md`.

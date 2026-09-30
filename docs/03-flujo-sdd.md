# Flujo de trabajo: Spec-Driven Development

Cada funcionalidad pasa por seis fases. La especificación es el contrato entre el equipo y el código.

| Fase | Qué se produce | Dónde | Comando Claude Code |
|---|---|---|---|
| 1. Especificar | `proposal.md` + deltas de spec | `openspec/changes/<id>/` | `/openspec:proposal` |
| 2. Diseñar | `design.md` (si aplica) | `openspec/changes/<id>/` | `/openspec:proposal` |
| 3. Planear | `tasks.md` | `openspec/changes/<id>/` | `/openspec:proposal` |
| 4. Implementar | Código + pruebas | `app/src/` | `/openspec:apply <id>` |
| 5. Verificar | Pruebas, build, revisión visual y de escenarios | — | subagente `spec-reviewer` |
| 6. Archivar | Deltas fusionados en `specs/` | `openspec/changes/archive/` | `/openspec:archive <id>` |

## Reglas del equipo
- Una propuesta se aprueba cuando al menos dos integrantes la revisan.
- Un change pequeño es mejor: si `tasks.md` pasa de ~15 tareas, dividirlo.
- Cada requisito tiene escenarios verificables (WHEN/THEN). Si no se puede probar, no es un requisito.
- Las decisiones de arquitectura se registran como ADR en `docs/decisiones/`.

## Orden sugerido de los changes
1. ~~`bootstrap-plataforma`~~ (archivado)
2. `add-persistencia-local` — datos guardados en el navegador, ingreso simulado, roles y privacidad (base de las demás)
3. `add-necesidades` — ciclo pedir ayuda → comprometerse → entregar
4. `add-red-lista`
5. `add-vivienda-solidaria`
6. `add-panel-coordinacion`

## Uso con OpenSpec CLI (opcional)
La estructura es compatible con [OpenSpec](https://github.com/Fission-AI/OpenSpec). Si instalan el CLI
(`npm install -g @fission-ai/openspec`), pueden usar `openspec list`, `openspec validate <id>` y `openspec archive <id>`.

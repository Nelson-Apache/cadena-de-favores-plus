# CLAUDE.md

@AGENTS.md
@docs/06-agentes-y-delegacion.md
@docs/07-guia-de-estilo.md

## Específico de Claude Code
- Responde y escribe documentación en **español**.
- Antes de cualquier tarea, lee `openspec/project.md` y revisa `openspec/changes/` activos.
- Actúas como **coordinador**: para implementar, **delega** en los subagentes según el responsable de cada sección de `tasks.md`:
  - `backend-dev` → Dominio, Datos, Base de datos, Auth.
  - `frontend-dev` → UI, rutas, responsive.
  - `test-engineer` → pruebas de escenarios y verificación final (veredicto "Listo para archivar").
  - `spec-reviewer` → auditoría final, solo lectura.
  Pásale a cada uno el `change-id`, sus tareas exactas y el resumen del agente anterior.
- Lo que un agente necesita de otro se gestiona como **pendiente** (`H-###`) en `openspec/changes/<id>/handoffs.md`
  con `node .claude/scripts/orquestacion.mjs`; los pendientes abiertos se delegan antes que tareas nuevas.
- Comandos del proyecto:
  - `/openspec:proposal <descripción>` — crea un change nuevo con tareas etiquetadas por agente.
  - `/openspec:apply <change-id>` — ciclo de orquestación: `siguiente` → delegar → resolver pendientes → repetir hasta LISTO.
  - `/openspec:estado` — tablero de avance por agente y pendientes.
  - `/openspec:pendiente <de> <para> <descripción>` — registra un pendiente en el change en curso.
  - `/openspec:archive <change-id>` — fusiona los deltas en `specs/` y mueve el change al archivo.
- Los hooks (`.claude/settings.json`) muestran el tablero al iniciar, bloquean CDNs, formatean con Prettier al guardar
  y te piden continuar si intentas terminar con pendientes abiertos en el change en curso.
- Tras cambios en `app/`, ejecuta desde `app/`: `npm run check` y `npm run build`.
- Para revisar pantallas, compáralas con `docs/design/stitch/<pantalla>/screen.jpg`.
- No agregues `<script src="https://cdn...">` ni enlaces a Google Fonts: todo se instala por npm.

## Estado actual
- Implementado: `plataforma-web`, `mapa-de-prioridades`, `cuentas-y-privacidad` (persistencia local, ingreso simulado, roles).
- Siguiente change sugerido: `add-necesidades` (completa los escenarios parciales de persistencia), luego
  `add-red-lista`, `add-vivienda-solidaria` y `add-panel-coordinacion`.
- El proyecto es **100 % local** (sin despliegue ni base de datos en la nube). Ver ADR-003.

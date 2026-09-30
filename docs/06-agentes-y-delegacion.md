# Agentes, delegación y orquestación

El proyecto se construye con un equipo de agentes especializados. El agente principal **coordina**: lee el change,
reparte las tareas, gestiona los pendientes entre agentes y cierra. Cada especialista trabaja solo en su territorio.

## Equipo
| Agente | Archivo | Se dedica a | Territorio |
|---|---|---|---|
| **Principal (coordinador)** | `CLAUDE.md` | Propone changes, delega, gestiona pendientes, integra y archiva | `openspec/**`, `docs/**` |
| **backend-dev** | `.claude/agents/backend-dev.md` | Reglas de negocio, repositorio, persistencia local | `app/src/domain/**`, `app/src/data/**` |
| **frontend-dev** | `.claude/agents/frontend-dev.md` | Pantallas, componentes, rutas, responsive | `app/src/features/**`, `components/**`, `pages/**`, `App.tsx`, `lib/` de UI |
| **test-engineer** | `.claude/agents/test-engineer.md` | Pruebas de escenarios, contrato, responsive | `app/src/**/*.test.ts(x)`, `app/e2e/**`, `docs/05-plan-de-pruebas.md` |
| **spec-reviewer** | `.claude/agents/spec-reviewer.md` | Auditoría final contra la spec (solo lectura) | — |

## Piezas de la orquestación
| Pieza | Dónde | Para qué |
|---|---|---|
| Tareas por responsable | `openspec/changes/<id>/tasks.md` (`## N. Sección · agente`) | Qué hace cada agente |
| Tablero de pendientes | `openspec/changes/<id>/handoffs.md` | Lo que un agente necesita de otro (`H-###`) |
| Change en curso | `.claude/state/cambio-activo.json` (local, no se versiona) | Qué change se está implementando ahora |
| CLI | `node .claude/scripts/orquestacion.mjs` | `estado`, `iniciar`, `siguiente`, `pendiente`, `resolver`, `terminar` |
| Comandos | `/openspec:apply`, `/openspec:estado`, `/openspec:pendiente` | Ciclo de orquestación y consultas |
| Hooks | `.claude/settings.json` + `.claude/hooks/` | Hacen cumplir las reglas automáticamente |

### Formato de un pendiente
```
- [ ] H-001 · de: frontend-dev · para: backend-dev · Necesito repository.createNeed(input): Promise<Need> para el formulario
- [x] H-001 · de: frontend-dev · para: backend-dev · Necesito … → ✔ Agregado en data/repository.ts
```
Lo crea el agente que lo necesita (`orquestacion.mjs pendiente`); lo cierra el coordinador (`orquestacion.mjs resolver`).

### Hooks
| Evento | Script | Qué hace |
|---|---|---|
| `SessionStart` | `session-start.mjs` | Al abrir Claude Code, carga el tablero: change en curso, avance por agente y pendientes |
| `PreToolUse` (Write/Edit) | `guard-cdn.mjs` | Bloquea cualquier CDN (Tailwind, Google Fonts, scripts externos) en `app/` |
| `PostToolUse` (Write/Edit) | `format-on-save.mjs` | Formatea con Prettier cada archivo de `app/src` que se edita: mismo estilo sin importar el agente |
| `Stop` | `stop-guard.mjs` | Si hay un change en curso con pendientes o tareas abiertas, pide continuar la orquestación antes de terminar (una vez; no hace ciclos) |

## Ciclo de orquestación (`/openspec:apply <id>`)
```
 iniciar <id>
     │
     ▼
 ┌─► siguiente ──► ¿pendiente H-### abierto? ──sí──► delegar al agente "para:" ──┐
 │        │ no                                                                   │
 │        ├─► tareas backend-dev abiertas ─────────► delegar a backend-dev ──────┤
 │        ├─► tareas frontend-dev / pruebas ───────► frontend-dev ‖ test-engineer┤
 │        ├─► verificación abierta ────────────────► test-engineer (veredicto) ──┤
 │        └─► LISTO ──► spec-reviewer ──► check + build ──► terminar ──► /openspec:archive
 │                                                                               │
 └──── resolver H-### · crear pendientes por fallos · estado ◄───────────────────┘
```

## Reglas de delegación
1. **Contrato antes que pantalla.** `frontend-dev` trabaja con los tipos y firmas de `backend-dev` (contra `mockRepository` mientras llega la persistencia local).
2. **Pendientes primero.** Un `H-###` abierto se resuelve antes de repartir tareas nuevas.
3. **Nadie invade otro territorio.** Lo que se necesite de otro agente se registra como pendiente.
4. **Un bug vuelve a su dueño.** `test-engineer` no corrige código de producción: crea un pendiente para quien lo escribió.
5. **Resumen obligatorio** de cada agente: tareas hechas, pendientes resueltos y creados, archivos tocados.
6. **Tope de 3 rondas** por pendiente o fallo; después se escala al usuario.
7. **Decisiones de negocio al usuario**, nunca inventadas por un agente.
8. **Mismas reglas para todos:** `docs/07-guia-de-estilo.md`.

## Uso rápido
```bash
node .claude/scripts/orquestacion.mjs estado                 # tablero de todos los changes
node .claude/scripts/orquestacion.mjs iniciar add-necesidades
node .claude/scripts/orquestacion.mjs siguiente              # a quién delegar ahora
node .claude/scripts/orquestacion.mjs pendiente add-necesidades frontend-dev backend-dev "Necesito …"
node .claude/scripts/orquestacion.mjs resolver add-necesidades H-001 "Hecho en …"
node .claude/scripts/orquestacion.mjs terminar               # pausa o cierre
```
En Claude Code basta con `/openspec:apply add-necesidades`; el coordinador ejecuta estos pasos por ti.

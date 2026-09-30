<!-- OPENSPEC:START -->
# Instrucciones OpenSpec

Estas instrucciones son para agentes de IA que trabajan en este proyecto.

Abre siempre `@/openspec/AGENTS.md` cuando la petición:
- Mencione planear o proponer (propuesta, spec, change, plan).
- Introduzca funcionalidades nuevas, cambios que rompen compatibilidad, cambios de arquitectura o trabajo grande de rendimiento o seguridad.
- Sea ambigua y necesites la spec oficial antes de escribir código.

Usa `@/openspec/AGENTS.md` para aprender a crear y aplicar propuestas de cambio, el formato de las specs y las convenciones del proyecto.

Mantén este bloque para que se pueda regenerar.
<!-- OPENSPEC:END -->

# Cadena de Favores+ · Guía para agentes

Plataforma web que mejora cadenadefavores.co para organizar la ayuda **antes** de un desastre en el Quindío:
**Red lista**, **Vivienda solidaria** y **Mapa de prioridades**. Proyecto académico (Design Thinking,
Universidad del Quindío). Contexto completo en `openspec/project.md`.

## Metodología: Spec-Driven Development
1. No se escribe código de producto sin un change en `openspec/changes/` aprobado por el equipo.
2. Las specs (`openspec/specs/`) describen lo que el sistema **ya hace**; los changes, lo que **va a hacer**.
3. Al implementar, sigue `tasks.md` en orden y marca `- [x]` al terminar cada tarea.
4. Al terminar un change: pruebas y build en verde, revisión visual contra `docs/design/stitch/`, y archivar.

## Equipo de agentes y delegación
El trabajo se reparte entre agentes especializados; cada uno trabaja solo en su territorio.
Detalle y flujo completo: `docs/06-agentes-y-delegacion.md`.

| Agente | Se dedica a | Territorio |
|---|---|---|
| Principal (coordinador) | Proponer, delegar, integrar, archivar | `openspec/**`, `docs/**` |
| `backend-dev` | Reglas de negocio, repositorio y persistencia local | `app/src/domain/**`, `app/src/data/**` |
| `frontend-dev` | Pantallas, componentes, rutas, responsive | `app/src/features/**`, `components/**`, `pages/**`, `App.tsx` |
| `test-engineer` | Pruebas de escenarios, contrato, responsive | `**/*.test.ts(x)`, `app/e2e/**`, `docs/05-plan-de-pruebas.md` |
| `spec-reviewer` | Auditoría final (solo lectura) | — |

Orden por change: **backend-dev** (contratos) → **test-engineer** y **frontend-dev** en paralelo → **test-engineer** (veredicto) → **spec-reviewer** → archivar.
Cada sección de `tasks.md` indica su responsable (`· backend-dev`, `· frontend-dev`, `· test-engineer`).
Lo que un agente necesita de otro se registra como pendiente `H-###` en `openspec/changes/<id>/handoffs.md`
(`node .claude/scripts/orquestacion.mjs pendiente …`); nadie resuelve trabajo fuera de su territorio.

## Calidad obligatoria (ver `docs/07-guia-de-estilo.md`)
- **SOLID** en dominio, datos y componentes.
- **Responsive mobile-first**: revisar 360, 390, 768, 1024 y 1440 px.
- **Mismo estilo en todo el proyecto**: solo tokens del design system y componentes de `components/ui`; formato con Prettier.
- Antes de entregar: `npm run check` (tipos + lint + formato + pruebas) y `npm run build`.

## Estructura del repositorio
```
AGENTS.md            ← este archivo (reglas para cualquier agente)
CLAUDE.md            ← instrucciones específicas de Claude Code
.claude/             ← comandos (/openspec:*) y subagentes
docs/                ← contexto, arquitectura, design system, decisiones (ADR), plan de pruebas
openspec/            ← project.md, specs/ (verdad actual), changes/ (propuestas)
app/                 ← aplicación web (React + TypeScript + Vite + Tailwind)
```

## Comandos (desde `app/`)
| Comando | Uso |
|---|---|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run test` | Pruebas de dominio (Vitest) |
| `npm run build` | Chequeo de tipos + build de producción |
| `npm run lint` | Lint (oxlint) |
| `npm run format` / `format:check` | Formatear / revisar formato (Prettier) |
| `npm run check` | Tipos + lint + formato + pruebas |

## Arquitectura de `app/src`
- `domain/` — reglas de negocio puras (prioridad, estado, precio de referencia, geo). **Sin React.** Toda regla nueva va aquí con su `*.test.ts`.
- `data/` — puerto `Repository` y adaptadores (`mockRepository`, luego `localStorageRepository`). La UI solo usa `repository` de `data/index.ts`. Proyecto 100 % local: sin servidor ni base de datos en la nube (ADR-003).
- `features/<capacidad>/` — pantallas por capacidad (landing, map, needs, red-lista, housing, coordination, help).
- `components/` — layout y UI compartida (Button, Badges, ProgressBar, Icon, Logo).
- `lib/` — utilidades (formato COP, etiquetas en español, `useAsync`).

## Reglas obligatorias
- **Nada de CDN en tiempo de ejecución.** Tailwind, fuentes e íconos van por npm. `cdn.tailwindcss.com` está bloqueado en Colombia (ADR-002).
- **Colores semánticos exclusivos:** rojo/ámbar/verde = estado de una necesidad; lila = viviendas; azul pizarra = Red lista. Acompañar siempre con texto o forma.
- **Privacidad:** nunca mostrar dirección exacta ni teléfono en vistas públicas; solo municipio, barrio y coordenada aproximada.
- **Textos de la interfaz en español de Colombia**, claros y empáticos (usuarios en situación de angustia).
- **Celular primero:** probar a 360–390 px; áreas táctiles de al menos 40 px.
- **Accesibilidad:** foco visible, `aria-*` en controles, contraste AA.
- No inventar reglas de negocio: si el documento de Design Thinking no lo define, anotarlo como pregunta abierta en el `proposal.md`.

## Referencias
- Documento fuente: `../Cadena_de_Favores_Design_Thinking.docx` (resumen en `docs/01-contexto-design-thinking.md`)
- Diseños de Stitch: `docs/design/stitch/` (HTML + captura por pantalla)
- Design system: `docs/design/design-system.md`

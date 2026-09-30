# Cadena de Favores+

**La ayuda lista antes de que la necesites.** Plataforma web que extiende
[Cadena de Favores](https://cadenadefavores.co) de la Cámara de Comercio de Armenia y del Quindío con tres funciones:

- 🛡️ **Red lista:** empresas y personas registran desde hoy lo que podrían prestar en una emergencia.
- 🏠 **Vivienda solidaria:** casas y habitaciones para familias damnificadas, con precio de referencia y sello de arriendo solidario.
- 🚦 **Mapa de prioridades:** estado y prioridad de cada necesidad para que la ayuda no se amontone en un solo lugar.

Proyecto académico · Design Thinking · Ingeniería de Sistemas y Computación, Universidad del Quindío (2026).
Equipo: Jeyson Styven Cáceres Mosquera, Salomé Pérez Franco, Nelson Enrique Apache Molina.

## Empezar
Requisitos: Node.js 20 o superior.
```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm run test       # pruebas de reglas de negocio
npm run build      # build de producción en app/dist
```
Todo funciona en local: no necesita servidor, base de datos ni credenciales. La app usa datos de demostración;
con el change `add-persistencia-local` lo registrado se guarda en el navegador.

## Estructura
```
├── AGENTS.md          reglas para agentes de IA (OpenSpec + convenciones)
├── CLAUDE.md          instrucciones de Claude Code
├── .claude/           agentes (front, back, test, revisor), comandos /openspec:*, hooks y CLI de orquestación
├── docs/              contexto, arquitectura, SDD, trazabilidad, pruebas, design system, ADR, diseños de Stitch
├── openspec/          project.md · specs/ (lo implementado) · changes/ (lo propuesto)
└── app/               React + TypeScript + Vite + Tailwind + Leaflet
```

## Estado
| Capacidad | Estado |
|---|---|
| Plataforma web (inicio, navegación, design system) | ✅ Implementada |
| Mapa de prioridades | ✅ Implementada con datos de prueba |
| Necesidades (pedir ayuda, detalle, compromisos) | 📝 `openspec/changes/add-necesidades` |
| Red lista | 📝 `openspec/changes/add-red-lista` |
| Vivienda solidaria | 📝 `openspec/changes/add-vivienda-solidaria` |
| Persistencia local, ingreso simulado y privacidad | 📝 `openspec/changes/add-persistencia-local` |
| Panel de coordinación | 📝 `openspec/changes/add-panel-coordinacion` |

## Cómo contribuir
Este proyecto usa **Spec-Driven Development**: primero la especificación, luego el código.
Lee [docs/03-flujo-sdd.md](docs/03-flujo-sdd.md), [docs/06-agentes-y-delegacion.md](docs/06-agentes-y-delegacion.md)
y [docs/07-guia-de-estilo.md](docs/07-guia-de-estilo.md). Antes de entregar: `npm run check` y `npm run build` en `app/`.

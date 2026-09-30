# Arquitectura

## Visión general
```
┌──────────────────────────── app/ (navegador) ─────────────────────────────┐
│  features/  ── pantallas por capacidad (landing, map, needs, housing, …)  │
│      │ usan                                                               │
│  components/ ── UI compartida (Navbar, Button, Badges, ProgressBar, Icon) │
│      │                                                                    │
│  domain/  ── reglas puras y probadas: prioridad, estado, precio, geo      │
│      ▲                                                                    │
│  data/    ── puerto Repository ──► mockRepository  (hoy, en memoria)      │
│                               └──► localStorageRepository ──► localStorage│
└───────────────────────────────────────────────┬────────────────────────────┘
                                                │ HTTPS (solo teselas del mapa)
                                        OpenStreetMap

 Todo corre en el equipo con `npm run dev`: sin servidor propio, base de datos en la nube ni credenciales (ADR-003).
```

## Stack
| Componente | Tecnología | Motivo |
|---|---|---|
| Interfaz | React 19 + TypeScript + Vite | Tipado, build rápido, ecosistema |
| Estilos | Tailwind CSS v3 (npm) | Mismos tokens que Stitch, sin CDN (ADR-002) |
| Mapa | Leaflet + React-Leaflet + OSM | Gratis, sin llave, liviano (propuesto en el documento) |
| Datos | `localStorage` del navegador (adaptador del puerto `Repository`) | Proyecto 100 % local, sin servidor ni credenciales (ADR-003) |
| Íconos / fuentes | lucide-react, Fontsource (Sora, DM Sans) | Empaquetados; funcionan con conexión débil |
| Pruebas | Vitest | Reglas de dominio |

## Estructura
```
app/
├── index.html
├── tailwind.config.ts        # tokens del design system
└── src/
    ├── main.tsx · App.tsx    # arranque y rutas
    ├── index.css             # Tailwind + estilos de marcadores
    ├── domain/               # types, status, priority, referencePrice, geo, availability (+ *.test.ts)
    ├── data/                 # repository (puerto), mockData, mockRepository, index (+ storage, localStorageRepository, session)
    ├── features/
    │   ├── landing/          # LandingPage
    │   └── map/              # MapPage, useMapData, markers
    ├── components/layout/    # AppShell, Navbar, Footer
    ├── components/ui/        # Button, Badges, ProgressBar, Icon, Logo
    ├── pages/                # PendingPage, NotFoundPage
    └── lib/                  # format, labels, useAsync
```

## Rutas
| Ruta | Pantalla | Estado |
|---|---|---|
| `/` | Inicio | Implementada |
| `/mapa` | Mapa de prioridades (`?vista=mas-falta`) | Implementada |
| `/necesidades/:id` | Detalle de necesidad | `add-necesidades` |
| `/pedir-ayuda` | Registrar necesidad (`?perfil=comerciante\|familia`) | `add-necesidades` |
| `/red-lista/registrar` | Registrar recurso | `add-red-lista` |
| `/vivienda/ofrecer` | Ofrecer vivienda | `add-vivienda-solidaria` |
| `/vivienda/:id` | Ficha de vivienda | `add-vivienda-solidaria` |
| `/coordinacion` | Panel de coordinación | `add-panel-coordinacion` |

## Principios
1. **Reglas en el dominio:** la UI no calcula prioridades ni precios; llama a `domain/`.
2. **Puerto de datos:** cambiar de memoria a `localStorage` (o, a futuro, a un servidor) no toca pantallas.
3. **Privacidad desde el modelo:** los tipos públicos (`ApproxLocation`) no tienen campos de dirección ni teléfono.
4. **Liviano:** el mapa se carga aparte (`lazy`); nada de CDN.

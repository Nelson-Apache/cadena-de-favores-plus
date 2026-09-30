# Plan de pruebas

## 1. Pruebas automáticas
Desde `app/`:
```bash
npm run test    # reglas de dominio (Vitest)
npm run build   # chequeo de tipos + build
```
| Archivo | Cubre |
|---|---|
| `domain/status.test.ts` | Estado sin ayuda / en camino / atendida, cierre al 100 %, avance |
| `domain/priority.test.ts` | Puntaje de 4 criterios, niveles, crecimiento por espera, orden "dónde hace más falta" |
| `domain/referencePrice.test.ts` | Referencia por barrio y municipio, sello, porcentaje por debajo |
| `domain/geo.test.ts` | Distancia, puntos cercanos, reconfirmación semestral |
| `domain/privacy.test.ts` | Contacto solo para las partes de una solicitud aceptada; redondeo de coordenadas a 3 decimales |
| `domain/profile.test.ts` | Validación de perfil nuevo (autorización Ley 1581, nombre, documento); roles |
| `data/repository.test.ts` | **Suite de contrato** de `Repository`: `mockRepository` y `localStorageRepository` (memoria) pasan las mismas pruebas y devuelven los mismos datos |
| `data/storage.test.ts` | Almacén en memoria; detección de navegador sin almacenamiento (`createBrowserStore`, `resolveStore`) |
| `data/localStorageRepository.test.ts` | Primera vez (siembra, JSON dañado, otra versión), restablecer, consulta pública sin datos privados, aceptación mutua |
| `data/localState.test.ts` | Recargar la página conserva necesidades, perfiles y sesión; restablecer y recargar vuelve al inicio |
| `data/session.test.ts` | Ingreso simulado, cierre de sesión, crear perfil con/sin autorización, efecto de restablecer en la sesión |
| `data/index.test.ts` | Módulo `@/data`: navegador o memoria (`isPersistent`), restablecer solo para coordinador |

| `app/e2e/verificar-ui.mjs` | Pruebas de UI en Edge/Chrome sin ventana (CDP, sin dependencias): escenarios de la spec, responsive y accesibilidad. Ejecutar desde `app/`: `npm run build && node e2e/verificar-ui.mjs` (56 comprobaciones) |

Regla: cada requisito con lógica de negocio debe tener al menos una prueba que corresponda a un `#### Scenario:`.

### Cobertura de escenarios · `add-persistencia-local` (spec `cuentas-y-privacidad`)
Nombres de prueba: `describe('<Requisito>') / it('<Scenario>: <detalle>')`. Rutas relativas a `app/src/`.

| Requisito › Escenario | Prueba | Resultado |
|---|---|---|
| Datos guardados › Recargar la página | `data/localState.test.ts` (necesidad registrada, perfil y sesión siguen tras recargar) | ✔ Pasa (capa de datos). La necesidad se registra con `localState.update` porque `createNeed` llega con `add-necesidades`; verificar de nuevo allí. Navegador: la sesión y el perfil creado sobreviven a la recarga (`e2e`). |
| Datos guardados › Primera vez | `data/localStorageRepository.test.ts` (almacén vacío, JSON dañado, otra versión, colección faltante); `data/index.test.ts` | ✔ Pasa |
| Datos guardados › Navegador sin almacenamiento | `data/storage.test.ts`, `data/index.test.ts` (`dataSource = 'memoria'`, `isPersistent = false`), `data/localStorageRepository.test.ts` (escritura fallida) | ✔ Pasa (datos). Aviso en pantalla (`role=status`) y mapa funcionando en memoria: ✔ `e2e` |
| Restablecer › Antes de una prueba con usuarios | `data/localStorageRepository.test.ts`, `data/session.test.ts`, `data/localState.test.ts`, `data/index.test.ts` | ✔ Pasa (datos). Confirmación en pantalla sin `confirm()`, Cancelar y Esc, sesión del coordinador se conserva: ✔ `e2e` |
| Inicio de sesión simulado › Ingresar como comerciante | `data/session.test.ts` (nombre, rol, id de perfil, hora de inicio) | ✔ Pasa (datos). Barra superior con nombre y rol (1440 px), menú móvil a 390 px, sesión tras recargar: ✔ `e2e`. Asociación de registros: pendiente de `add-necesidades` |
| Inicio de sesión simulado › Publicar sin sesión | `e2e/verificar-ui.mjs` (las 3 rutas piden "Primero ingresa", el enlace conserva `?volver=` y tras ingresar regresa a la ruta) | ✔ Pasa |
| Tratamiento de datos › Crear perfil | `data/session.test.ts`, `domain/profile.test.ts`, `e2e/verificar-ui.mjs` (sin casilla: mensaje junto al campo, foco en la casilla, sin sesión; con casilla: crea y persiste) | ✔ Pasa |
| Ubicación aproximada pública › Consulta pública | `data/localStorageRepository.test.ts` (sin `address`/`phone`/`email`/`docNumber`, ≤ 3 decimales, redondeo al guardar) | ✔ Pasa |
| Consentimiento para compartir contacto › Aceptación mutua | `data/localStorageRepository.test.ts`, `domain/privacy.test.ts` | ✔ Pasa |
| Roles › Usuario sin rol coordinador | `domain/profile.test.ts`, `data/index.test.ts` (restablecer prohibido sin coordinador) | ✔ Pasa (datos). `/coordinacion` con rol usuario muestra "Acceso restringido" y sin botón de restablecer; sin sesión pide ingresar: ✔ `e2e` |
| Tarea 4.1 · Suite de contrato | `data/repository.test.ts` | ✔ Pasa (ambos adaptadores) |
| Tarea 4.2 · Recargar conserva / Restablecer vuelve al inicio | `data/localState.test.ts` | ✔ Pasa (capa de datos) |

Responsive y accesibilidad de las pantallas nuevas (Ingresar, acceso restringido / pedir ingreso, menú de usuario, coordinación con restablecer y diálogo), medidas con `e2e/verificar-ui.mjs` en 7 vistas × 5 anchos (35 combinaciones):

| Criterio | 360 | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| Sin desplazamiento horizontal | ✔ | ✔ | ✔ | ✔ | ✔ |
| Un solo `h1` por vista | ✔ | ✔ | ✔ | ✔ | ✔ |
| Botones, enlaces y campos de `main`, diálogo y botones de la barra ≥ 40 px (casillas y radios: su `label`) | ✔ | ✔ | ✔ | ✔ | ✔ |
| Todo campo con `label` y todo control con nombre accesible | ✔ | ✔ | ✔ | ✔ | ✔ |

Además: diálogo de restablecer cabe en 360 px con botones ≥ 40 px; foco visible en 14 tabulaciones de `/ingresar`; casilla y radios enlazados a su texto y a la descripción (`aria-describedby`); campos con error marcan `aria-invalid`; sin excepciones de JavaScript.

Observación de usabilidad (no bloquea; pendiente H-001 para `frontend-dev`): en la barra superior (fuera de las pantallas nuevas) el logo ocupa 2 líneas a 1024 px (56 px), los enlaces de navegación miden 36 px a 1024–1439 px, y entre 1024 y 1279 px el botón de cuenta muestra solo iniciales (tiene `aria-label`/`title` con nombre y rol). Los enlaces de texto del pie miden 18 px (ya ocurría antes del change).

## 2. Pruebas con usuarios (fase 5 del Design Thinking)
Entre 5 y 8 participantes cercanos a cada tipo de usuario. Cada uno hace las tareas sin ayuda; el equipo observa y toma notas.

| # | Tarea | Disponible desde |
|---|---|---|
| 1 | Como empresario, registrar un camión en la Red lista | `add-red-lista` |
| 2 | Como persona que quiere ayudar, ofrecer una habitación para una familia | `add-vivienda-solidaria` |
| 3 | Como familia damnificada, encontrar una vivienda gratis o en arriendo solidario en su municipio | `add-vivienda-solidaria` |
| 4 | Como comerciante afectado, encontrar una bodega disponible cerca | Ya posible en el mapa (capa Recursos); completo con `add-red-lista` |
| 5 | Como donante, encontrar la necesidad de mayor prioridad sin ayuda y comprometerse | Mapa listo; compromiso con `add-necesidades` |
| 6 | Como coordinador, decir qué municipio tiene más necesidades sin atender | Ya posible (aviso del mapa) |

### Registro de resultados
| Participante | Tipo de usuario | Tarea | ¿La completó? | Tiempo | Comentarios y dificultades |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

### Malla de retroalimentación
| Lo que funcionó | Lo que se puede mejorar |
|---|---|
| | |
| **Preguntas que surgieron** | **Ideas nuevas** |
| | |

Los cambios que salgan de las pruebas se registran como nuevos changes (`update-...`) en OpenSpec.

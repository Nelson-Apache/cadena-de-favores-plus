# Trazabilidad de requisitos

## Requisitos funcionales (documento, sección "Propuesta de solución ingenieril")
| RF | Requisito | Spec / change | Código | Estado |
|---|---|---|---|---|
| RF1 | Registrar un recurso (tipo, descripción, ubicación, disponibilidad, contacto) | `add-red-lista` › Registrar un recurso | — | Propuesto |
| RF2 | Ofrecer una vivienda (tipo, capacidad, condiciones, tiempo, precio, inspección) | `add-vivienda-solidaria` › Ofrecer una vivienda | — | Propuesto |
| RF3 | Registrar una necesidad (tipo, cantidad, personas, vulnerables) | `add-necesidades` › Registrar una necesidad | — | Propuesto |
| RF4 | Mapa con íconos diferentes y color de estado | `mapa-de-prioridades` › Mapa con tres tipos / Estado de la ayuda | `features/map/*`, `domain/status.ts` | Implementado |
| RF5 | Calcular prioridad con 4 criterios y actualizarla cada día | `mapa-de-prioridades` › Nivel de prioridad | `domain/priority.ts` | Implementado (cálculo); se recalcula al leer con la fecha actual |
| RF6 | Comprometerse, marcar entregada y confirmar entrega | `add-necesidades` › Comprometerse / Confirmar la entrega | — | Propuesto |
| RF7 | Cerrar al 100 % y sugerir puntos cercanos sin ayuda | `mapa-de-prioridades` › Cierre al 100 %; `add-necesidades` › Redirigir | `domain/status.ts`, `domain/geo.ts` | Regla implementada; UI propuesta |
| RF8 | Filtrar por municipio, tipo, estado y prioridad | `mapa-de-prioridades` › Filtros | `features/map/MapPage.tsx` | Implementado |
| RF9 | Precio de referencia por zona y sello | `add-vivienda-solidaria` › Precio de referencia y sello | `domain/referencePrice.ts` | Regla implementada; UI propuesta |
| RF10 | Dirección y contacto solo con aceptación mutua | `add-vivienda-solidaria`, `add-persistencia-local` | `domain/types.ts` (`ApproxLocation`) | Parcial |

## Requisitos no funcionales
| RNF | Requisito | Dónde se cumple |
|---|---|---|
| RNF1 | Funcionar bien en celular | `plataforma-web` › Adaptable a celular; menú móvil y conmutador lista/mapa |
| RNF2 | Cargar rápido con conexión débil | Mapa con carga diferida; sin CDN; fuentes e íconos empaquetados |
| RNF3 | Protección de datos (Ley 1581 de 2012) | `add-persistencia-local` › Tratamiento de datos; Consentimiento para compartir contacto |
| RNF4 | Verificación con cédula o NIT | `add-persistencia-local` › Inicio de sesión simulado (verificación simulada) |
| RNF5 | Reportes de la comunidad | `add-necesidades` › Reportar publicación sospechosa |

## Pruebas de usuario (fase de Testeo) → change
| Tarea | Change |
|---|---|
| 1. Registrar un camión en la Red lista | `add-red-lista` |
| 2. Ofrecer una habitación | `add-vivienda-solidaria` |
| 3. Encontrar vivienda gratis o solidaria | `add-vivienda-solidaria` |
| 4. Encontrar una bodega cercana | `add-red-lista` |
| 5. Comprometerse con la necesidad de mayor prioridad | `add-necesidades` (+ mapa ya implementado) |
| 6. Identificar el municipio con más necesidades sin atender | `mapa-de-prioridades` (aviso), `add-panel-coordinacion` |

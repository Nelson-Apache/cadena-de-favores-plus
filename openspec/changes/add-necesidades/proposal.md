# Change: Registrar necesidades, ver su detalle y comprometerse

## Why
Hoy el mapa muestra necesidades de prueba, pero un comerciante o una familia no puede publicar la suya, y quien
quiere ayudar no puede comprometerse. Es el ciclo central de la plataforma (requisitos funcionales 3, 6 y 7 del documento).

## What Changes
- Formulario **Pedir ayuda** (`/pedir-ayuda`) para comerciante o familia: tipo, ítems y cantidades, personas,
  vulnerabilidad, municipio y barrio.
- **Detalle de una necesidad** (`/necesidades/:id`): estado, prioridad con sus 4 criterios, avance por ítem,
  historial de compromisos y puntos cercanos sin ayuda.
- **Compromiso**: quien ayuda elige ítem y cantidad; el receptor confirma la entrega.
- **Redirección**: si la necesidad ya está cubierta, se sugieren los puntos rojos más cercanos.
- Reporte de publicación sospechosa.

## Impact
- Nueva capacidad: `necesidades`.
- Usa reglas ya existentes: `aidStatus`, `acceptsOffers`, `computePriority`, `nearest`.
- Diseños: `docs/design/stitch/pedir-ayuda`, `docs/design/stitch/detalle-necesidad`.
- Funciona contra `mockRepository`; con `add-persistencia-local` los registros se conservan al recargar.

## Preguntas abiertas
- ¿Quién confirma la entrega cuando el receptor no tiene acceso a internet? (propuesta: un coordinador puede confirmar).
- ¿Límite de necesidades activas por usuario para evitar duplicados?

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

## Decisiones (resueltas con el usuario el 2026-09-29)
- **Confirmación de entrega:** la confirma el receptor; si no tiene acceso a internet, un coordinador puede confirmarla por él.
- **Límite:** máximo **3 necesidades activas por usuario**. Al llegar al tope, el formulario pide completar o cerrar una antes de publicar otra.

## Preguntas abiertas (para las pruebas con usuarios)
- ¿Puede alguien comprometerse con su propia necesidad? (hoy no hay regla que lo impida)
- ¿Se puede cancelar o cerrar una necesidad para liberar cupo del máximo de 3? (hoy solo se libera al quedar "Atendida")
- ¿Qué pasa si quien ayuda nunca entrega (compromiso vencido)?

## Supuestos de implementación (backend-dev)
- Necesidad activa = no "Atendida". El límite de 3 aplica también al coordinador.
- La confirmación puede hacerse directo desde "comprometido" (receptor o coordinador), sin que quien ayuda marque la entrega.
- Una necesidad nueva usa como coordenada el centro del municipio (sin dirección exacta ni teléfono).
- `DATA_VERSION` = 2 (claves `cdf-plus:v2`): los datos guardados con v1 se descartan y se resiembran.

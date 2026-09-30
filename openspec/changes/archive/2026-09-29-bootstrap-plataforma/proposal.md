# Change: Base de la plataforma web y mapa de prioridades

## Why
El Design Thinking concluyó que la solución debe ser **web** (no app móvil) y construirse sobre el mapa que ya existe.
Se necesitaba una base técnica común (stack, design system, rutas) y la función central, el **Mapa de prioridades**,
para que las demás funciones se agreguen como changes independientes.

## What Changes
- Proyecto `app/` con React + TypeScript + Vite, Tailwind compilado por npm (sin CDN), fuentes e íconos empaquetados.
- Design system de Stitch convertido en tokens de Tailwind (`app/tailwind.config.ts`).
- Estructura común: barra de navegación, footer, página 404 y pantallas "pendiente" para rutas especificadas.
- Página de inicio con métricas calculadas desde los datos.
- Reglas de dominio puras y probadas: estado de la ayuda, cierre al 100 %, prioridad (4 criterios),
  orden "dónde hace más falta", precio de referencia y sello, distancia y reconfirmación semestral.
- Mapa de prioridades con Leaflet, filtros, vista "dónde hace más falta", aviso de zona rezagada y vista móvil.
- Puerto `Repository` con datos de prueba (`mockRepository`).

## Impact
- Specs creadas: `plataforma-web`, `mapa-de-prioridades`.
- Código: `app/src/**`.
- Las reglas de precio de referencia y reconfirmación quedan listas en `domain/` para los changes
  `add-vivienda-solidaria` y `add-red-lista`.

# Diseño técnico: bootstrap-plataforma

## Decisiones
1. **React + Vite + TypeScript.** Ecosistema conocido por el equipo, build rápido y buen soporte de Leaflet.
2. **Tailwind v3 compilado (no CDN).** Los diseños de Stitch usan Tailwind v3 con `tailwind.config` en línea;
   se migró esa configuración a `tailwind.config.ts`. `cdn.tailwindcss.com` está bloqueado por los operadores en
   Colombia (verificado con wifi y datos móviles), por eso el CDN queda prohibido. Ver ADR-002.
3. **Fuentes e íconos empaquetados.** `@fontsource-variable/sora`, `@fontsource-variable/dm-sans` y `lucide-react`.
   Evita que la interfaz se rompa con conexión débil o sin acceso a Google Fonts.
4. **Arquitectura por capas.** `domain/` no importa React ni Supabase; la UI consume el puerto `Repository`.
   Permite probar las reglas del documento sin interfaz y cambiar de datos de prueba a Supabase sin tocar pantallas.
5. **Mapa con Leaflet + OpenStreetMap.** Gratis, sin llave de API. Marcadores `divIcon` con SVG en línea
   (forma distinta por entidad, no solo color).
6. **Carga diferida del mapa.** `MapPage` se importa con `lazy()`: el inicio no descarga Leaflet.

## Prioridad: pesos propuestos
Cuatro criterios de 0–3 puntos (máx. 12). Alta ≥ 8, media ≥ 5. Ver tabla en `specs/mapa-de-prioridades/spec.md`.
Son valores iniciales; deben validarse en la fase de Testeo con coordinadores reales.

## Estado de la ayuda
- Compromisos por encima de lo pedido no cuentan (evita que un solo donante "cierre" una necesidad inflando cifras).
- "Atendida" exige **entrega** confirmada, no solo compromiso: así el verde significa ayuda real recibida.

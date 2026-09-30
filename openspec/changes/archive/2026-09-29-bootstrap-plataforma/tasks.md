# Tareas: bootstrap-plataforma

## 1. Proyecto
- [x] 1.1 Crear `app/` con Vite + React + TypeScript
- [x] 1.2 Instalar Tailwind v3, PostCSS y plugins `forms` y `container-queries` por npm
- [x] 1.3 Migrar tokens del `DESIGN.md` de Stitch a `tailwind.config.ts`
- [x] 1.4 Empaquetar fuentes (Sora, DM Sans) e íconos (lucide-react); eliminar dependencias de CDN
- [x] 1.5 Alias `@/` y scripts `dev`, `build`, `test`, `typecheck`

## 2. Dominio (con pruebas Vitest)
- [x] 2.1 Tipos de dominio (`domain/types.ts`)
- [x] 2.2 Estado de la ayuda y cierre al 100 % (`status.ts`)
- [x] 2.3 Prioridad con 4 criterios y orden "dónde hace más falta" (`priority.ts`)
- [x] 2.4 Precio de referencia y sello (`referencePrice.ts`)
- [x] 2.5 Distancia y puntos cercanos (`geo.ts`); reconfirmación semestral (`availability.ts`)

## 3. Datos
- [x] 3.1 Puerto `Repository` y `mockRepository` con datos del escenario Quimbaya/Armenia
- [x] 3.2 Cliente de Supabase opcional (`supabaseClient.ts`), aún no activo — retirado después por ADR-003

## 4. UI
- [x] 4.1 AppShell, Navbar (con menú móvil), Footer, 404, pantalla "pendiente"
- [x] 4.2 Página de inicio
- [x] 4.3 Mapa de prioridades: capas, filtros, "dónde hace más falta", aviso de zona rezagada, lista sincronizada, vista móvil
- [x] 4.4 Carga diferida del mapa

## 5. Verificación
- [x] 5.1 `npm run test` (24 pruebas) y `npm run build` sin errores
- [x] 5.2 Revisión visual en 1440 px y 390 px

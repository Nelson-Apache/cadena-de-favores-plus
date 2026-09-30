# Proyecto: Cadena de Favores+

## Propósito
Plataforma web que extiende **Cadena de Favores** (cadenadefavores.co, Cámara de Comercio de Armenia y del Quindío)
para que la ayuda ante desastres naturales esté **organizada antes de la emergencia** y llegue también a las
**familias que perdieron su vivienda**.

Enunciado del reto (Design Thinking, fase de Definición):
> Diseñar una mejora para Cadena de Favores que permita registrar recursos y viviendas disponibles antes de una
> emergencia, para que la ayuda a negocios y familias afectadas se active en horas y no en semanas.

La propuesta agrega tres funciones sobre el mapa existente:
1. **Red lista** — recursos registrados antes del desastre (resuelve el *antes*).
2. **Vivienda solidaria** — casas y habitaciones para familias damnificadas (resuelve el *a quién*).
3. **Mapa de prioridades** — estado y prioridad de cada necesidad para repartir la ayuda (resuelve el *dónde*).

Fuera de alcance (decisión del equipo): mapa de riesgo sísmico y de deslizamientos, bot de WhatsApp, semáforo estructural.

## Usuarios
| Usuario | Necesita | Le preocupa |
|---|---|---|
| Comerciante afectado | Reparar el local, recuperar mercancía, transporte, bodega, asesoría | Perder el negocio, que la ayuda llegue tarde |
| Familia damnificada | Un lugar seguro donde vivir | Albergue prolongado, arriendos que suben, vivienda insegura |
| Empresa o persona que ayuda | Saber qué se necesita y dónde | Que su ayuda no llegue, perder tiempo |
| Coordinador | Ver qué zonas se quedan atrás | Saturar un lugar mientras otro espera |

## Stack técnico
- **Frontend:** React 19 + TypeScript + Vite (`app/`).
- **Estilos:** Tailwind CSS v3 **instalado por npm y compilado en el build**. Prohibido usar `cdn.tailwindcss.com`
  (bloqueado por los operadores en Colombia; ver `docs/decisiones/ADR-002-tailwind-sin-cdn.md`).
- **Mapa:** Leaflet + React-Leaflet con teselas de OpenStreetMap.
- **Datos:** 100 % local, sin servidor ni base de datos en la nube (ADR-003). Datos en el navegador (`localStorage`)
  con `add-persistencia-local`; mientras no se aplique,
  la app usa `src/data/mockRepository.ts` detrás del puerto `Repository`.
- **Pruebas:** Vitest para reglas de dominio (`src/domain/*.test.ts`).
- **Íconos y fuentes:** Material Symbols Rounded, Sora (títulos) y DM Sans (texto) desde Google Fonts.

## Convenciones
- Idioma del producto, specs y commits: **español de Colombia**. Código (identificadores) en inglés,
  salvo términos de dominio sin traducción natural (`barrio`, `municipio`).
- Arquitectura por capas: `domain/` (reglas puras, sin React) → `data/` (puerto `Repository` + adaptadores)
  → `features/` (pantallas por capacidad) → `components/` (UI compartida).
- Toda regla de negocio vive en `src/domain/` con pruebas; la UI no calcula prioridades ni precios.
- Colores semánticos: rojo/ámbar/verde **solo** para el estado de una necesidad; lila **solo** viviendas;
  azul pizarra **solo** recursos de la Red lista. Nunca usar solo el color para comunicar (forma + texto).
- Privacidad: en público solo se muestra municipio, barrio y coordenada aproximada. Dirección exacta y teléfono
  se comparten únicamente con consentimiento de ambas partes.
- Accesibilidad: contraste AA, foco visible, textos alternativos, navegación por teclado.
- Rendimiento: debe funcionar en celular con conexión móvil débil (bundle pequeño, imágenes livianas).

## Restricciones legales y de dominio
- **Ley 1581 de 2012** (protección de datos personales): consentimiento, finalidad y acceso restringido.
- **Ley 1523 de 2012** (gestión del riesgo): la plataforma cubre la fase de preparación con la Red lista.
- Verificación de usuarios con cédula o NIT; la comunidad puede reportar publicaciones sospechosas.

## Capacidades (specs)
| Capacidad | Estado | Dónde |
|---|---|---|
| `plataforma-web` | Implementada | `openspec/specs/plataforma-web` |
| `mapa-de-prioridades` | Implementada (datos de prueba) | `openspec/specs/mapa-de-prioridades` |
| `necesidades` | Propuesta | `openspec/changes/add-necesidades` |
| `red-lista` | Propuesta | `openspec/changes/add-red-lista` |
| `vivienda-solidaria` | Propuesta | `openspec/changes/add-vivienda-solidaria` |
| `coordinacion` | Propuesta | `openspec/changes/add-panel-coordinacion` |
| `cuentas-y-privacidad` | Implementada (local, ingreso simulado) | `openspec/specs/cuentas-y-privacidad` |

## Referencias
- Documento de Design Thinking: `../../Cadena_de_Favores_Design_Thinking.docx` (junto a la carpeta del proyecto)
- Resumen del documento: `docs/01-contexto-design-thinking.md`
- Diseños (Stitch): `docs/design/`

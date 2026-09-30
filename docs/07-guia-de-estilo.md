# Guía de estilo del proyecto

Obligatoria para todos los agentes y personas. Objetivo: que todo el proyecto parezca escrito por una sola mano.

## 1. Principios SOLID aplicados
| Principio | En el dominio y datos (backend-dev) | En la UI (frontend-dev) |
|---|---|---|
| **S** Responsabilidad única | Un módulo por concepto (`priority.ts`, `status.ts`); funciones pequeñas | Página orquesta → secciones → componentes; la lógica va en hooks `useXxx` |
| **O** Abierto/cerrado | Reglas como tablas de configuración (`TYPE_POINTS`) | Variantes por props (`variant`, `size`), no `if` por pantalla |
| **L** Sustitución de Liskov | `mockRepository` y `localStorageRepository` cumplen el mismo contrato (suite compartida) | Componentes que envuelven HTML aceptan sus props nativas |
| **I** Segregación de interfaces | Repositorios por capacidad si `Repository` crece | Props mínimas; no pasar objetos completos sin necesidad |
| **D** Inversión de dependencias | El dominio no importa React ni `localStorage` | La UI usa `@/data` y `@/domain`, nunca el almacenamiento directamente |

## 2. Estructura y nombres
- Carpetas en `kebab-case`; componentes en `PascalCase.tsx`; hooks `useCamelCase.ts`; utilidades `camelCase.ts`.
- Pruebas junto al archivo: `priority.ts` → `priority.test.ts`.
- Importaciones con alias `@/` (nunca `../../..`). Orden: librerías → `@/` → relativas.
- Exportaciones con nombre (`export function X`), salvo `App.tsx`.
- Identificadores en inglés; términos de dominio sin traducción natural en español (`barrio`, `municipio`).
- Textos visibles y comentarios de documentación en español de Colombia.
- TypeScript estricto: sin `any`, sin `!` salvo en el arranque, tipos de unión en lugar de `enum`.

## 3. Formato automático
- **Prettier** (`app/.prettierrc.json`): sin punto y coma, comillas simples, 2 espacios, ancho 120, comas finales.
- **EditorConfig** (`.editorconfig`): UTF-8, LF, 2 espacios.
- Antes de entregar: `npm run format` y `npm run lint`.

## 4. Estilo visual (mismo en todas las pantallas)
| Elemento | Clases |
|---|---|
| Contenedor de página | `mx-auto max-w-content px-4 lg:px-6` |
| Sección | `py-16 md:py-20` |
| Tarjeta | `rounded-card border border-line bg-white p-5 md:p-6 shadow-soft` |
| Título de página | `font-display text-[28px] md:text-headline-lg font-bold text-ink` |
| Título de tarjeta | `font-display text-headline-sm text-ink` |
| Texto secundario | `text-sm text-ink-soft` |
| Etiqueta superior (eyebrow) | `text-xs font-semibold uppercase tracking-[0.14em] text-primary-light` |
| Campo de formulario | `rounded-xl border-line bg-white focus:border-primary focus:ring-primary` |
| Botones | Siempre `Button` / `ButtonLink` (`primary`, `secondary`, `ghost`, `light`) |
| Íconos | Siempre `Icon` (lucide), tamaño con `text-[Npx]` |

Prohibido: colores hex en componentes, `style={{ color }}`, CDN, fuentes nuevas, sombras o radios fuera de los tokens.
Si falta un token, se agrega en `tailwind.config.ts` y en `docs/design/design-system.md` (con aviso al principal).

## 5. Responsive (mobile-first)
| Ancho | Breakpoint | Comportamiento esperado |
|---|---|---|
| 360–767 px | base | 1 columna, menú hamburguesa, paneles laterales como conmutador o debajo, botones a ancho completo en formularios |
| 768–1023 px | `md:` | 2 columnas en grillas de tarjetas; formularios en 1 columna |
| ≥ 1024 px | `lg:` | Navegación completa, formularios 2 columnas (form + resumen fijo), mapa con panel lateral |
| ≥ 1440 px | — | Contenido centrado en `max-w-content`; nada se estira a todo el ancho salvo el mapa |

Reglas: sin desplazamiento horizontal; áreas táctiles ≥ 40 px; texto ≥ 14 px en celular; imágenes con `w-full` y proporción fija;
tablas anchas con `overflow-x-auto` dentro de su tarjeta.

## 6. Accesibilidad y contenido
- HTML semántico (`header`, `main`, `nav`, `section`, `article`), un `h1` por página.
- Cada campo con `label`; errores junto al campo y en texto.
- Color nunca como único indicador (estado = color + texto; entidad = color + forma).
- Tono empático y directo: "Cuéntanos qué necesitas", no "Formulario de solicitud".
- Cifras en formato colombiano (`formatCOP`, `formatNumber`).

## 7. Commits y ramas
- Rama por change: `change/<change-id>`.
- Commits en español con prefijo: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `style:`, `chore:`; mencionar el change: `feat(add-necesidades): formulario pedir ayuda`.

# Design system · Cadena de Favores+

Generado en Stitch (proyecto "Cadena de Favores+ (Web)") y llevado a código en `app/tailwind.config.ts`.
Tokens completos exportados: [stitch-DESIGN.md](stitch-DESIGN.md).

**Tono:** cercano, sereno, confiable y cívico. Identidad cálida inspirada en el paisaje cafetero, distinta del
azul corporativo (#0240A7) de cadenadefavores.co.

## Color
| Token Tailwind | Hex | Uso |
|---|---|---|
| `primary` | #0F5563 | Petróleo: navegación, botones primarios, enlaces |
| `primary-dark` | #003D48 | Hover y títulos de marca |
| `ink` | #13262B | Texto principal, hero y footer oscuros |
| `surface` | #FAF7F2 | Fondo crema |
| `surface-card` | #FFFFFF | Tarjetas |
| `line` | #E6DFD3 | Bordes |
| `sand` | #EFE6D8 | Franjas de fondo |
| `housing` | #7B5EA7 | **Solo** viviendas solidarias y su sello |
| `resource` | #3B6FD8 | **Solo** recursos de la Red lista |
| `need-none` | #D64545 | Estado: sin ayuda |
| `need-transit` | #E0A100 | Estado: ayuda en camino |
| `need-done` | #2E9E5B | Estado: atendida |

Reglas:
- El semáforo solo se usa para el estado de una necesidad, nunca como decoración.
- El color siempre va acompañado de texto o forma (pin, cuadrado, casa).
- Prioridad: alta = rojo sólido; media = contorno ámbar; baja = gris.

## Tipografía
| Estilo | Fuente | Tamaño / interlineado |
|---|---|---|
| `display-lg` | Sora 700 | 56 / 64 |
| `headline-lg` | Sora 700 | 32 / 40 |
| `headline-md` | Sora 600 | 24 / 32 |
| `headline-sm` | Sora 600 | 20 / 28 |
| Cuerpo | DM Sans 400 | 16 / 24 |
| Etiquetas | DM Sans 500–600 | 12–14 |

Fuentes empaquetadas con Fontsource (`@fontsource-variable/sora`, `@fontsource-variable/dm-sans`).

## Forma
- Tarjetas: `rounded-card` (12 px), borde `line`, sombra `shadow-soft`; al pasar el cursor `shadow-lift`.
- Botones y chips: `rounded-full`.
- Contenedor: `max-w-content` (1200 px), márgenes de 16 px en celular y 24 px en escritorio.

## Componentes (`app/src/components/ui`)
| Componente | Descripción |
|---|---|
| `Button`, `ButtonLink` | Variantes `primary`, `secondary`, `ghost`, `light` |
| `StatusBadge` | Punto + texto del estado de la ayuda |
| `PriorityBadge` | Prioridad alta / media / baja |
| `SolidaritySeal` | Sello circular estilo tinta, lila, girado −12° |
| `ProgressBar` | Barra "comprometido frente a pedido" con el color del estado |
| `Icon` | Íconos SVG (lucide) con nombres estilo Material Symbols |
| `Logo`, `LogoMark` | Dos eslabones cruzados formando "+" |

## Referencias de pantallas
| Pantalla | Carpeta |
|---|---|
| Inicio | `stitch/inicio` |
| Mapa de prioridades | `stitch/mapa-de-prioridades` |
| Detalle de necesidad | `stitch/detalle-necesidad` |
| Pedir ayuda | `stitch/pedir-ayuda` (la captura salió sin estilos; usar el `code.html`) |
| Registrar recurso | `stitch/registrar-recurso` |
| Ofrecer vivienda | `stitch/ofrecer-vivienda` |
| Ficha de vivienda | `stitch/ficha-vivienda` |
| Panel de coordinación | `stitch/panel-coordinacion` |

> Los `code.html` de Stitch cargan Tailwind desde `cdn.tailwindcss.com`, bloqueado en Colombia. Para verlos con
> estilos, ábranlos con una VPN (por ejemplo, Cloudflare WARP). En la app los estilos se compilan con npm.

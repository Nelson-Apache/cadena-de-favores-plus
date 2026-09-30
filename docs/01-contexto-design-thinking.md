# Contexto: Design Thinking

Resumen del documento *Cadena de Favores+ — Propuesta de solución con Design Thinking para la atención de desastres
naturales* (Jeyson Styven Cáceres Mosquera, Salomé Pérez Franco, Nelson Enrique Apache Molina · Armenia, septiembre de 2026).

## 1. Problemática
- Caso: sismo que afectó al Quindío en 2026 y la plataforma **Cadena de Favores** (cadenadefavores.co), creada por
  la Cámara de Comercio de Armenia y del Quindío para responder a la emergencia.
- Encuesta de la Cámara a más de 1.600 actores y 600 visitas: **55 %** reportó afectaciones, **22,4 %** no podía operar,
  más de **3.600 empleos** comprometidos.
- Necesidades más repetidas: daños en infraestructura, pérdida de mercancía, dudas sobre seguros y orientación jurídica.
- Límites de la plataforma actual: **solo existe después del desastre** (se creó desde cero) y **deja por fuera a las
  familias** que perdieron su casa.

**Pregunta de trabajo:** ¿cómo lograr que la ayuda esté organizada antes de la próxima emergencia y que también
llegue a las familias sin hogar?

## 2. Empatía — usuarios
| Usuario | Qué necesita | Qué le preocupa |
|---|---|---|
| Comerciante afectado | Reparar el local, recuperar mercancía, transporte, bodega, asesoría sobre seguros | Perder el negocio, no saber a quién pedir ayuda, que la ayuda llegue tarde |
| Familia damnificada | Un lugar seguro donde vivir mientras repara o reubica su casa | Albergue prolongado, arriendos que suben, llegar a otra casa insegura |
| Empresa o persona que quiere ayudar | Saber qué se necesita y dónde | Que su ayuda no llegue, perder tiempo en llamadas |

## 3. Definición — hallazgos
- La ayuda existe, pero se organiza cuando ya pasó el desastre; los primeros días se pierden buscando quién ayuda.
- Los recursos más pedidos (bodega, transporte, equipos, mano de obra) casi siempre los tiene otro empresario de la región.
- Las familias no tienen un canal para vivienda temporal, y los arriendos suben después del desastre.
- Quien quiere ayudar necesita saber con precisión qué hace falta y dónde.

**Reto:** diseñar una mejora para Cadena de Favores que permita registrar recursos y viviendas disponibles antes
de una emergencia, para que la ayuda a negocios y familias se active en horas y no en semanas.

## 4. Ideación — ideas seleccionadas
| Idea | Impacto | Facilidad | Novedad | Total |
|---|---|---|---|---|
| Red lista | 5 | 4 | 5 | 14 |
| Vivienda solidaria | 5 | 4 | 5 | 14 |
| Mapa de prioridades | 5 | 4 | 4 | 13 |

Descartadas por alcance: bot de WhatsApp, mapa de riesgo sísmico, "Pasa el favor", botón de compartir, semáforo estructural.

## 5. Prototipado — funciones
- **Red lista:** recursos (bodegas, camiones, plantas, equipos, horas profesionales) registrados desde ya, con ícono
  "disponible" y reconfirmación cada seis meses.
- **Vivienda solidaria:** tipo de oferta (gratis, arriendo solidario, arriendo normal), capacidad, tiempo, inspección de
  habitabilidad; barrio visible y contacto solo con aceptación mutua; precio de referencia de la zona y sello
  "Arriendo solidario".
- **Mapa de prioridades:** estado (rojo sin ayuda, amarillo en camino, verde atendida), prioridad alta/media/baja por
  tipo, personas, vulnerabilidad y tiempo de espera; barra de avance que cierra al 100 %; sugerencia de puntos rojos
  cercanos; vista por municipio; filtro "dónde hace más falta".

## 6. Requisitos
Funcionales (RF1–RF10) y no funcionales en [04-requisitos-trazabilidad.md](04-requisitos-trazabilidad.md).

## 7. Cambio respecto al documento
El documento mostraba bocetos tipo aplicación móvil. El equipo decidió construir una **plataforma web** (adaptable a celular)
con un diseño propio, distinto del sitio actual. Los diseños nuevos están en [design/stitch/](design/stitch/).

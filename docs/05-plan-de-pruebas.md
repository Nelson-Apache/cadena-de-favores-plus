# Plan de pruebas

## 1. Pruebas automáticas
Desde `app/`:
```bash
npm run test    # reglas de dominio (Vitest)
npm run build   # chequeo de tipos + build
```
| Archivo | Cubre |
|---|---|
| `domain/status.test.ts` | Estado sin ayuda / en camino / atendida, cierre al 100 %, avance |
| `domain/priority.test.ts` | Puntaje de 4 criterios, niveles, crecimiento por espera, orden "dónde hace más falta" |
| `domain/referencePrice.test.ts` | Referencia por barrio y municipio, sello, porcentaje por debajo |
| `domain/geo.test.ts` | Distancia, puntos cercanos, reconfirmación semestral |
| `domain/privacy.test.ts` | Contacto solo para las partes de una solicitud aceptada; redondeo de coordenadas a 3 decimales |
| `domain/profile.test.ts` | Validación de perfil nuevo (autorización Ley 1581, nombre, documento); roles |
| `data/repository.test.ts` | **Suite de contrato** de `Repository`: `mockRepository` y `localStorageRepository` (memoria) pasan las mismas pruebas y devuelven los mismos datos |
| `data/storage.test.ts` | Almacén en memoria; detección de navegador sin almacenamiento (`createBrowserStore`, `resolveStore`) |
| `data/localStorageRepository.test.ts` | Primera vez (siembra, JSON dañado, otra versión), restablecer, consulta pública sin datos privados, aceptación mutua |
| `data/localState.test.ts` | Recargar la página conserva necesidades, perfiles y sesión; restablecer y recargar vuelve al inicio |
| `data/session.test.ts` | Ingreso simulado, cierre de sesión, crear perfil con/sin autorización, efecto de restablecer en la sesión |
| `data/index.test.ts` | Módulo `@/data`: navegador o memoria (`isPersistent`), restablecer solo para coordinador |
| `domain/{commitment,delivery,needForm,needLimit,redirect}.test.ts` | Compromiso (limita a lo que falta), entrega y permisos, validación del formulario, límite de 3 activas, puntos cercanos |
| `data/needsOperations.test.ts` | Ciclo de una necesidad sobre las operaciones compartidas |
| `data/needsContract.test.ts` | **Suite de contrato de necesidades**: `createNeed`, `commit`, `markDelivered`, `confirmDelivery`, `listCommitments`, `reportNeed`, `listReports` en `mockRepository` y `localStorageRepository` |
| `data/needsPersistence.test.ts` | Recarga con `createNeed`, coordenadas a 3 decimales, sin `address`/`phone`, suscriptores, versión 2 de los datos, coherencia de la semilla |

| `app/e2e/verificar-ui.mjs` | Pruebas de UI en Edge/Chrome sin ventana (CDP, sin dependencias): escenarios de la spec, responsive y accesibilidad. Ejecutar desde `app/`: `npm run build && node e2e/verificar-ui.mjs` (112 comprobaciones; lee `DATA_VERSION` de `src/data/localState.ts`; con `CAPTURAS=<carpeta>` guarda capturas) |

Regla: cada requisito con lógica de negocio debe tener al menos una prueba que corresponda a un `#### Scenario:`.

### Cobertura de escenarios · `add-persistencia-local` (spec `cuentas-y-privacidad`)
Nombres de prueba: `describe('<Requisito>') / it('<Scenario>: <detalle>')`. Rutas relativas a `app/src/`.

| Requisito › Escenario | Prueba | Resultado |
|---|---|---|
| Datos guardados › Recargar la página | `data/localState.test.ts` (necesidad registrada, perfil y sesión siguen tras recargar) | ✔ Pasa (capa de datos). La necesidad se registra con `localState.update` porque `createNeed` llega con `add-necesidades`; verificar de nuevo allí. Navegador: la sesión y el perfil creado sobreviven a la recarga (`e2e`). |
| Datos guardados › Primera vez | `data/localStorageRepository.test.ts` (almacén vacío, JSON dañado, otra versión, colección faltante); `data/index.test.ts` | ✔ Pasa |
| Datos guardados › Navegador sin almacenamiento | `data/storage.test.ts`, `data/index.test.ts` (`dataSource = 'memoria'`, `isPersistent = false`), `data/localStorageRepository.test.ts` (escritura fallida) | ✔ Pasa (datos). Aviso en pantalla (`role=status`) y mapa funcionando en memoria: ✔ `e2e` |
| Restablecer › Antes de una prueba con usuarios | `data/localStorageRepository.test.ts`, `data/session.test.ts`, `data/localState.test.ts`, `data/index.test.ts` | ✔ Pasa (datos). Confirmación en pantalla sin `confirm()`, Cancelar y Esc, sesión del coordinador se conserva: ✔ `e2e` |
| Inicio de sesión simulado › Ingresar como comerciante | `data/session.test.ts` (nombre, rol, id de perfil, hora de inicio) | ✔ Pasa (datos). Barra superior con nombre y rol (1440 px), menú móvil a 390 px, sesión tras recargar: ✔ `e2e`. Asociación de registros: pendiente de `add-necesidades` |
| Inicio de sesión simulado › Publicar sin sesión | `e2e/verificar-ui.mjs` (las 3 rutas piden "Primero ingresa", el enlace conserva `?volver=` y tras ingresar regresa a la ruta) | ✔ Pasa |
| Tratamiento de datos › Crear perfil | `data/session.test.ts`, `domain/profile.test.ts`, `e2e/verificar-ui.mjs` (sin casilla: mensaje junto al campo, foco en la casilla, sin sesión; con casilla: crea y persiste) | ✔ Pasa |
| Ubicación aproximada pública › Consulta pública | `data/localStorageRepository.test.ts` (sin `address`/`phone`/`email`/`docNumber`, ≤ 3 decimales, redondeo al guardar) | ✔ Pasa |
| Consentimiento para compartir contacto › Aceptación mutua | `data/localStorageRepository.test.ts`, `domain/privacy.test.ts` | ✔ Pasa |
| Roles › Usuario sin rol coordinador | `domain/profile.test.ts`, `data/index.test.ts` (restablecer prohibido sin coordinador) | ✔ Pasa (datos). `/coordinacion` con rol usuario muestra "Acceso restringido" y sin botón de restablecer; sin sesión pide ingresar: ✔ `e2e` |
| Tarea 4.1 · Suite de contrato | `data/repository.test.ts` | ✔ Pasa (ambos adaptadores) |
| Tarea 4.2 · Recargar conserva / Restablecer vuelve al inicio | `data/localState.test.ts` | ✔ Pasa (capa de datos) |

### Cobertura de escenarios · `add-necesidades` (spec `necesidades`), ronda final
Rutas relativas a `app/src/`; `e2e` = `app/e2e/verificar-ui.mjs` (Edge sin ventana). Resultado al 2026-09-30: 299/299 pruebas de Vitest y 112/112 comprobaciones de navegador (ver nota de intermitencias).

| Requisito › Escenario | Prueba | Resultado |
|---|---|---|
| Registrar › Familia pide carpas | `data/needsContract.test.ts`, `domain/needForm.test.ts`; `e2e`: publica 5 carpas / 18 personas / niños / Quimbaya / La Española, el detalle dice "Sin ayuda" y prioridad 9/12, la tarjeta del mapa la lista como "Sin ayuda" y hay un marcador rojo más, ubicación solo barrio con ≤ 3 decimales y sin `address`/`phone` | ✔ Pasa |
| Registrar › Datos incompletos | `data/needsContract.test.ts`, `domain/needForm.test.ts`; `e2e`: formulario vacío y casos de solo cantidad / solo municipio: error junto al campo (`aria-invalid`, `aria-describedby`), foco al primer error, no publica | ✔ Pasa |
| Registrar › Ítems con el mismo nombre se rechazan (H-003) | `domain/needForm.test.ts`, `data/needsOperations.test.ts`; `e2e`: dos «Carpas» y « carpas » en `/pedir-ayuda` no navegan al detalle, `#need-items-error` dice «nombre distinto» dentro del grupo de ítems (`aria-describedby`), el foco queda en el grupo y no se crea ninguna necesidad en `cdf-plus:v2` | ✔ Pasa |
| Registrar › Perfil preseleccionado | `e2e`: `?perfil=comerciante`, `?perfil=familia`, valor desconocido y sin parámetro; enlace "Comerciante afectado" del inicio | ✔ Pasa |
| Detalle › Explicación de la prioridad | `data/needsContract.test.ts`; `e2e`: 4 criterios visibles (tipo, personas, vulnerabilidad, días de espera) con "N de 3" en una necesidad nueva y en la sembrada n-484 | ✔ Pasa |
| Comprometerse › Compromiso parcial | `data/needsContract.test.ts`; `e2e`: "2 de 5 carpas", "Ayuda en camino", historial | ✔ Pasa |
| Comprometerse › Cantidad mayor a lo que falta | `data/needsContract.test.ts`; `e2e`: faltan 3, se piden 5, queda en 3 y avisa "El resto ya no hace falta"; cantidad 0 muestra error junto al campo | ✔ Pasa |
| Confirmar entrega › Entrega confirmada completa | `data/needsContract.test.ts`; `e2e`: quien ayuda marca entregado (un tercero no ve "Confirmar entrega"), el receptor confirma y pasa a "Atendida" (una sola confirmación sigue "Ayuda en camino"); un coordinador confirma por el receptor | ✔ Pasa |
| Redirigir › Oferta a necesidad cubierta | `data/needsContract.test.ts`; `e2e`: aviso "ya está cubierta", hasta 3 puntos "Sin ayuda" con km, sin repetir la misma necesidad, foco en el bloque; también con la sembrada n-500 | ✔ Pasa |
| Reportar › Reporte | `data/needsContract.test.ts`; `e2e`: motivo vacío se rechaza; con motivo queda en `reports` (`reporterId` del usuario); sin sesión se ofrece ingresar | ✔ Pasa |
| Límite de 3 activas (decisión) | `data/needsContract.test.ts`, `domain/needLimit.test.ts`; `e2e`: con 3 activas aviso `role=alert` y botón deshabilitado, `requestSubmit` no publica | ✔ Pasa |
| Privacidad del detalle público | `e2e`: HTML del detalle (sin sesión, empresa, coordinador) no contiene `ownerId`, documento, teléfono ni dirección | ✔ Pasa |
| `cuentas-y-privacidad` › Recargar la página (parcial cerrado) | `data/needsPersistence.test.ts` | ✔ Pasa |
| Ubicación aproximada pública (necesidad creada) | `data/needsPersistence.test.ts`; `e2e` (4.623, -75.763) | ✔ Pasa |

Intermitencias del arnés (no de la interfaz): el conteo de marcadores del mapa y las capturas de pantalla dependían de esperas fijas; ahora se espera a que el mapa termine de pintar y la página se marca como enfocada (`Emulation.setFocusEmulationEnabled`). En 2 de unas 7 ejecuciones apareció una vez "Uncaught (in promise)" sin origen identificado (antes de que el script imprimiera el detalle del mensaje); no volvió a aparecer en las últimas ejecuciones. Si reaparece, el script ya imprime mensaje y origen. Actualización: en 3 de 4 ejecuciones seguidas el script terminó en 112/112; en la restante volvió a aparecer el "Uncaught (in promise)" (`reading 'id'`/`'url'`, unos 350 eventos que provienen de las expresiones `evaluate` del propio arnés y no de la aplicación; no se pudo aislar su origen). Además se corrigió el recorrido de foco por teclado: el enlace "Saltar al contenido" devuelve su texto con un salto de línea final y no se detectaba la vuelta completa a la página (falso fallo).

H-003 (backend-dev) resuelto en el dominio: `validateNewNeed` rechaza ítems con el mismo nombre (sin distinguir mayúsculas, tildes ni espacios sobrantes) y `createNeed` lanza `NeedValidationError` en ambos adaptadores. Ya no hay hallazgo abierto: el `e2e` lo verifica como escenario normal.

Observaciones de accesibilidad y usabilidad (no bloquean): los mensajes de error de campo (`FieldError`) no llevan `role="alert"`; se anuncian por `aria-describedby` + `aria-invalid` y el foco pasa al primer campo con error (los avisos globales, como el del límite de 3, sí usan `role="alert"`). En celular la tarjeta "¿Cómo quieres ayudar?" queda después del historial (unos 1 500 px de desplazamiento en la necesidad n-482).

Responsive y accesibilidad de `/pedir-ayuda` y `/necesidades/:id` (rutas nuevas), medidas con `e2e` en 6 vistas nuevas × 5 anchos: Pedir ayuda con sesión y con errores de validación; detalle sin sesión, con sesión de quien ayuda, con sesión de la dueña y detalle cubierto (n-500). "Pedir ayuda sin sesión" ya estaba en la tabla anterior.

| Criterio | 360 | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| Sin desplazamiento horizontal | ✔ | ✔ | ✔ | ✔ | ✔ |
| Un solo `h1` | ✔ | ✔ | ✔ | ✔ | ✔ |
| Botones, enlaces y campos ≥ 40 px (casillas y radios: su `label`) | ✔ | ✔ | ✔ | ✔ | ✔ |
| Todo campo con `label` y todo control con nombre accesible | ✔ | ✔ | ✔ | ✔ | ✔ |

Además: foco visible en el recorrido con Tab de `/pedir-ayuda` y del detalle; errores enlazados al campo por `aria-describedby`.

### Tarea 4.2 · Pruebas de usuario 1 y 5 (recorrido guiado en navegador sin ventana, 390 px)
- **Tarea 5 (donante): completada sin ayuda en 6 toques.** Ingresar como "Empresa que ayuda", abrir el menú, ir al Mapa, activar "Dónde hace más falta", "Me comprometo" en la primera tarjeta (Agua potable para vereda: sin ayuda, prioridad alta) y "Me comprometo" en el detalle; el sistema confirma "Quedaste comprometido". Fricciones: hay que ingresar antes de comprometerse (se conserva la ruta) y el detalle propone cantidad 1 por defecto, sin indicar cuánto falta en el campo.
- **Tarea 1 (registrar un camión en la Red lista): no disponible**, depende de `add-red-lista`. Como recorrido equivalente se ejecutó el del afectado (ingresar como familia, `/pedir-ayuda`, publicar carpas y llegar al detalle con "Tu necesidad ya está publicada"), completado sin ayuda. La tarea 1 real queda para `add-red-lista`. Estos recorridos son automáticos: el tiempo y las dudas reales se miden con personas.

### Tarea 4.3 · Revisión visual contra Stitch (capturas propias en el directorio temporal de la sesión, fuera del repo)
- `pedir-ayuda/screen.jpg` está mal exportada (HTML sin estilos: controles sueltos sobre fondo negro), así que se comparó con su HTML. La pantalla implementada mantiene los bloques (perfil, tipo, detalle, ubicación), el panel lateral y el botón "Publicar mi necesidad": 1 columna a 390 px y formulario más panel lateral a 1440 px.
- `detalle-necesidad/screen.jpg` (1440 px): coincide la estructura (cabecera con estado y prioridad, "Por qué es prioridad alta" en 4 tarjetas, "Lo que se necesita" con barras, historial, tarjeta "¿Cómo quieres ayudar?" y "Puntos cercanos sin ayuda" a la derecha, "Reportar"). En celular las tarjetas se apilan y todo cabe en 390 px.
- Diferencias intencionales ya aceptadas: sin "Verificación en terreno/JAC", escala de 12 puntos en vez de 95/100, sin "¿De dónde lo traes…", sin mini-mapa ni barra sísmica, sin lila para Techo, ítems con cantidad y unidad. Otras diferencias: sin migas de pan ni barra de alerta sísmica, sin los porcentajes de peso por criterio (se muestra "N de 3"), y cantidad del compromiso como campo numérico sin botones +/-. Ninguna afecta la spec.

#### Cuentas y privacidad (change anterior)
Responsive y accesibilidad de las pantallas nuevas (Ingresar, acceso restringido / pedir ingreso, menú de usuario, coordinación con restablecer y diálogo), medidas con `e2e/verificar-ui.mjs` en 7 vistas × 5 anchos (35 combinaciones):

| Criterio | 360 | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| Sin desplazamiento horizontal | ✔ | ✔ | ✔ | ✔ | ✔ |
| Un solo `h1` por vista | ✔ | ✔ | ✔ | ✔ | ✔ |
| Botones, enlaces y campos de `main`, diálogo y botones de la barra ≥ 40 px (casillas y radios: su `label`) | ✔ | ✔ | ✔ | ✔ | ✔ |
| Todo campo con `label` y todo control con nombre accesible | ✔ | ✔ | ✔ | ✔ | ✔ |

Además: diálogo de restablecer cabe en 360 px con botones ≥ 40 px; foco visible en 14 tabulaciones de `/ingresar`; casilla y radios enlazados a su texto y a la descripción (`aria-describedby`); campos con error marcan `aria-invalid`; sin excepciones de JavaScript.

Observación de usabilidad (no bloquea; pendiente H-001 para `frontend-dev`): en la barra superior (fuera de las pantallas nuevas) el logo ocupa 2 líneas a 1024 px (56 px), los enlaces de navegación miden 36 px a 1024–1439 px, y entre 1024 y 1279 px el botón de cuenta muestra solo iniciales (tiene `aria-label`/`title` con nombre y rol). Los enlaces de texto del pie miden 18 px (ya ocurría antes del change).

## 2. Pruebas con usuarios (fase 5 del Design Thinking)
Entre 5 y 8 participantes cercanos a cada tipo de usuario. Cada uno hace las tareas sin ayuda; el equipo observa y toma notas.

| # | Tarea | Disponible desde |
|---|---|---|
| 1 | Como empresario, registrar un camión en la Red lista | `add-red-lista` |
| 2 | Como persona que quiere ayudar, ofrecer una habitación para una familia | `add-vivienda-solidaria` |
| 3 | Como familia damnificada, encontrar una vivienda gratis o en arriendo solidario en su municipio | `add-vivienda-solidaria` |
| 4 | Como comerciante afectado, encontrar una bodega disponible cerca | Ya posible en el mapa (capa Recursos); completo con `add-red-lista` |
| 5 | Como donante, encontrar la necesidad de mayor prioridad sin ayuda y comprometerse | Mapa listo; compromiso con `add-necesidades` |
| 6 | Como coordinador, decir qué municipio tiene más necesidades sin atender | Ya posible (aviso del mapa) |

### Registro de resultados
| Participante | Tipo de usuario | Tarea | ¿La completó? | Tiempo | Comentarios y dificultades |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

### Malla de retroalimentación
| Lo que funcionó | Lo que se puede mejorar |
|---|---|
| | |
| **Preguntas que surgieron** | **Ideas nuevas** |
| | |

Los cambios que salgan de las pruebas se registran como nuevos changes (`update-...`) en OpenSpec.

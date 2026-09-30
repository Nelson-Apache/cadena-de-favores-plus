# Pendientes entre agentes: add-persistencia-local

Formato: `- [ ] H-### · de: <agente> · para: <agente> · <qué se necesita y por qué>`
Al resolver: marcar `[x]` y agregar ` → ✔ <resultado>`. Gestionar con `.claude/scripts/orquestacion.mjs`.

## Abiertos y resueltos
- [x] H-001 · de: test-engineer · para: frontend-dev · No bloqueante (usabilidad, barra superior de Navbar/Logo). Reproducir: abrir / a 1024 px sin sesión (node app/e2e/verificar-ui.mjs imprime la observación). (1) El logo 'Cadena de Favores+ / RED CÍVICA DEL QUINDÍO' ocupa 2 líneas (56 px de alto) solo a 1024 px; desde 1100 px queda en 36 px. (2) Los enlaces de la barra (Mapa, Red lista, Vivienda solidaria, Coordinación) miden 36 px de alto a 1024–1439 px (< 40 px de la guía). (3) Entre 1024 y 1279 px el botón de cuenta muestra solo iniciales; tiene aria-label y title con nombre y rol, pero el rol no se ve en pantalla. Propuesta: reducir el tamaño/wordmark del logo a 1024 px, usar min-h-10 en enlaces de la barra y evaluar mostrar el rol (p. ej. lg:hidden en el nombre pero insignia de rol). → ✔ Logo en una línea a 1024 px, enlaces min-h-10, rol visible en el botón de cuenta (lg–xl). e2e 56/56

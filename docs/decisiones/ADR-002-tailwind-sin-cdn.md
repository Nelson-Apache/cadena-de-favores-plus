# ADR-002: Tailwind, fuentes e íconos sin CDN

- **Estado:** Aceptada · 2026-09-29
- **Contexto:** Las pantallas exportadas de Stitch cargan Tailwind con `<script src="https://cdn.tailwindcss.com">`.
  Al revisarlas, el dominio `tailwindcss.com` no cargaba desde Colombia, ni con wifi ni con datos móviles, ni desde
  el computador ni desde el celular, aunque fuera del país funciona. Sin ese script las pantallas se ven sin estilos.
  Además, la plataforma debe funcionar con conexión móvil débil.
- **Decisión:**
  1. Tailwind CSS v3 se instala por npm y se compila en el build (`tailwind.config.ts` con los tokens de Stitch).
  2. Fuentes Sora y DM Sans desde Fontsource (npm), no desde Google Fonts.
  3. Íconos SVG con `lucide-react`, no con la fuente Material Symbols.
  4. Queda prohibido agregar scripts o estilos desde CDN en `app/`.
- **Consecuencias:** La interfaz se ve completa aunque haya bloqueos de red; el CSS final pesa unos 7 kB comprimido.
  Los `code.html` de `docs/design/stitch/` siguen dependiendo del CDN y solo sirven como referencia.

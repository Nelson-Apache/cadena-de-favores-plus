# ADR-001: Plataforma web en lugar de aplicación móvil

- **Estado:** Aceptada · 2026-09-29
- **Contexto:** Los bocetos del Design Thinking mostraban una app móvil. La plataforma actual (cadenadefavores.co) es web,
  y la propuesta debe integrarse a ella sin empezar de cero. Los usuarios necesitan entrar sin instalar nada, incluso
  desde celulares con poca memoria o conexión débil.
- **Decisión:** Construir una aplicación web adaptable a celular (React + Vite), con las ideas de los bocetos
  rediseñadas para escritorio y celular en Stitch.
- **Consecuencias:** Un solo código para todos los dispositivos; se puede integrar o enlazar desde el sitio actual.
  Las notificaciones push quedan para una fase posterior (PWA).

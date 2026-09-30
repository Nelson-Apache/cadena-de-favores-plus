import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'
import type { Config } from 'tailwindcss'

/**
 * Design tokens de Cadena de Favores+.
 * Fuente de verdad: docs/design/design-system.md (derivado del DESIGN.md exportado de Stitch).
 * Regla: los colores de estado (need-*) solo se usan para el estado de una necesidad;
 * lila (housing) solo para viviendas; azul pizarra (resource) solo para recursos de la Red lista.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marca
        primary: { DEFAULT: '#0F5563', dark: '#003D48', light: '#286675', soft: '#B0ECFD' },
        ink: { DEFAULT: '#13262B', soft: '#40484B', muted: '#70787B' },
        surface: { DEFAULT: '#FAF7F2', low: '#F6F3EE', mid: '#F0EDE9', high: '#EBE8E3', card: '#FFFFFF' },
        sand: { DEFAULT: '#EFE6D8', dark: '#D6C4A8' },
        line: '#E6DFD3',
        // Semánticos por entidad
        housing: { DEFAULT: '#7B5EA7', dark: '#43276D', soft: '#ECDCFF' },
        resource: { DEFAULT: '#3B6FD8', soft: '#DCE6FA' },
        // Semáforo de estado de una necesidad
        need: {
          none: '#D64545', 'none-soft': '#FBE4E4',
          transit: '#E0A100', 'transit-soft': '#FCF1D2',
          done: '#2E9E5B', 'done-soft': '#DDF2E5',
        },
      },
      fontFamily: {
        display: ['"Sora Variable"', 'Sora', 'system-ui', 'sans-serif'],
        body: ['"DM Sans Variable"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['56px', { lineHeight: '64px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.01em' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      },
      borderRadius: { card: '12px' },
      boxShadow: {
        soft: '0 1px 2px rgba(19,38,43,0.04), 0 8px 24px rgba(19,38,43,0.06)',
        lift: '0 2px 4px rgba(19,38,43,0.06), 0 16px 40px rgba(19,38,43,0.10)',
      },
      maxWidth: { content: '1200px' },
    },
  },
  plugins: [forms, containerQueries],
} satisfies Config

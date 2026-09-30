#!/usr/bin/env node
// Hook PreToolUse (Write|Edit|MultiEdit): impide introducir dependencias de CDN en app/.
// Motivo: cdn.tailwindcss.com está bloqueado en Colombia y la app debe funcionar con conexión débil (ADR-002).
const BLOCKED = [
  /cdn\.tailwindcss\.com/i,
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /<script[^>]+src=["']https?:\/\//i,
  /<link[^>]+href=["']https?:\/\/[^"']+\.css/i,
]

let input = ''
process.stdin.on('data', (c) => (input += c))
process.stdin.on('end', () => {
  try {
    const { tool_input: ti = {} } = JSON.parse(input || '{}')
    const file = String(ti.file_path || '').replace(/\\/g, '/')
    if (!/\/app\//.test(file) || /\/node_modules\//.test(file)) process.exit(0)
    const texts = [ti.content, ti.new_string, ...(ti.edits || []).map((e) => e.new_string)].filter(Boolean)
    const hit = BLOCKED.find((re) => texts.some((t) => re.test(t)))
    if (hit) {
      process.stderr.write(
        `Bloqueado: ${file} intenta cargar recursos desde un CDN (${hit}). ` +
          'En este proyecto Tailwind, fuentes e íconos se instalan por npm (ver docs/decisiones/ADR-002-tailwind-sin-cdn.md). ' +
          'Usa las clases de Tailwind compiladas, @fontsource y el componente Icon.',
      )
      process.exit(2)
    }
  } catch {
    // ante un error del hook, no bloquear
  }
  process.exit(0)
})

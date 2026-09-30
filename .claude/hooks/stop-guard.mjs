#!/usr/bin/env node
// Hook Stop: si hay un change en curso con pendientes entre agentes abiertos o tareas sin cerrar,
// pide a Claude que continúe la orquestación antes de terminar.
// Solo bloquea una vez seguida (stop_hook_active) para no crear ciclos infinitos.
import { getActive, summarize } from '../scripts/lib/tablero.mjs'

let input = ''
process.stdin.on('data', (c) => (input += c))
process.stdin.on('end', () => {
  try {
    const data = input ? JSON.parse(input) : {}
    if (data.stop_hook_active) process.exit(0)
    const active = getActive()
    if (!active) process.exit(0)
    const s = summarize(active.changeId)
    const openTasks = s.tasks.filter((t) => !t.done)
    if (!s.openHandoffs.length && !openTasks.length) process.exit(0)

    const parts = []
    if (s.openHandoffs.length)
      parts.push(`${s.openHandoffs.length} pendiente(s) entre agentes: ${s.openHandoffs.map((h) => `${h.id} (${h.from}→${h.to})`).join(', ')}`)
    if (openTasks.length) parts.push(`${openTasks.length} tarea(s) sin cerrar en tasks.md`)

    const reason =
      `Orquestación de ${active.changeId} incompleta: ${parts.join('; ')}. ` +
      `Ejecuta "node .claude/scripts/orquestacion.mjs siguiente" y delega al agente indicado. ` +
      `Si el usuario pidió pausar o hay una pregunta abierta que lo bloquea, explícalo y termina; ` +
      `para cerrar la orquestación sin archivar usa "node .claude/scripts/orquestacion.mjs terminar".`
    process.stdout.write(JSON.stringify({ decision: 'block', reason }))
    process.exit(0)
  } catch {
    process.exit(0)
  }
})

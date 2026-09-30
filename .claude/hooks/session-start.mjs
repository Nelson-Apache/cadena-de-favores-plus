#!/usr/bin/env node
// Hook SessionStart: agrega al contexto de Claude el tablero de orquestación
// (change en curso, avance por agente y pendientes abiertos).
import { getActive, renderBoard } from '../scripts/lib/tablero.mjs'

try {
  const active = getActive()
  const board = renderBoard({ onlyActive: false })
  const guide = active
    ? `\nHay un change en curso (${active.changeId}). Continúa la orquestación con /openspec:apply ${active.changeId}.`
    : '\nNo hay un change en curso. Para implementar uno: /openspec:apply <change-id>.'
  process.stdout.write(board + guide + '\n')
} catch {
  // Nunca bloquear el inicio de sesión por un error del tablero.
}
process.exit(0)

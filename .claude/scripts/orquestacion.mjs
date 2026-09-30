#!/usr/bin/env node
// CLI de orquestación. Uso (desde la raíz del proyecto):
//   node .claude/scripts/orquestacion.mjs estado [--activo]
//   node .claude/scripts/orquestacion.mjs iniciar <change-id>
//   node .claude/scripts/orquestacion.mjs terminar
//   node .claude/scripts/orquestacion.mjs pendiente <change-id> <de> <para> "<descripción>"
//   node .claude/scripts/orquestacion.mjs resolver <change-id> <H-###> "<resultado>"
//   node .claude/scripts/orquestacion.mjs siguiente [<change-id>]   → a quién delegar ahora

import fs from 'node:fs'
import path from 'node:path'
import {
  AGENTES,
  CHANGES_DIR,
  clearActive,
  getActive,
  handoffsPath,
  readHandoffs,
  renderBoard,
  setActive,
  summarize,
} from './lib/tablero.mjs'

const [cmd, ...args] = process.argv.slice(2)
const fail = (msg) => {
  console.error(`✗ ${msg}`)
  process.exit(1)
}
const ensureChange = (id) => {
  if (!id) fail('Falta <change-id>.')
  if (!fs.existsSync(path.join(CHANGES_DIR, id, 'proposal.md'))) fail(`No existe openspec/changes/${id}/proposal.md`)
}
const ensureHandoffs = (id) => {
  const p = handoffsPath(id)
  if (!fs.existsSync(p)) {
    fs.writeFileSync(
      p,
      `# Pendientes entre agentes: ${id}\n\n` +
        `Formato: \`- [ ] H-### · de: <agente> · para: <agente> · <qué se necesita y por qué>\`\n` +
        `Al resolver: marcar \`[x]\` y agregar \` → ✔ <resultado>\`. Gestionar con \`.claude/scripts/orquestacion.mjs\`.\n\n` +
        `## Abiertos y resueltos\n`,
    )
  }
  return p
}

switch (cmd) {
  case 'estado': {
    console.log(renderBoard({ onlyActive: args.includes('--activo') }))
    break
  }
  case 'iniciar': {
    const [id] = args
    ensureChange(id)
    ensureHandoffs(id)
    setActive(id)
    console.log(`✓ Change en curso: ${id}`)
    console.log(renderBoard({ onlyActive: true }))
    break
  }
  case 'terminar': {
    const a = getActive()
    clearActive()
    console.log(a ? `✓ Se cerró la orquestación de ${a.changeId}` : 'No había change en curso.')
    break
  }
  case 'pendiente': {
    const [id, from, to, ...rest] = args
    ensureChange(id)
    const text = rest.join(' ').trim()
    if (!AGENTES.includes(from) || !AGENTES.includes(to)) fail(`Agentes válidos: ${AGENTES.join(', ')}`)
    if (!text) fail('Falta la descripción del pendiente.')
    const p = ensureHandoffs(id)
    const next = readHandoffs(id).reduce((m, h) => Math.max(m, Number(h.id.slice(2))), 0) + 1
    const hid = `H-${String(next).padStart(3, '0')}`
    fs.appendFileSync(p, `- [ ] ${hid} · de: ${from} · para: ${to} · ${text}\n`)
    console.log(`✓ ${hid} creado (${from} → ${to})`)
    break
  }
  case 'resolver': {
    const [id, hid, ...rest] = args
    ensureChange(id)
    const p = ensureHandoffs(id)
    const result = rest.join(' ').trim() || 'resuelto'
    const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/)
    const i = lines.findIndex((l) => l.startsWith(`- [ ] ${hid} `))
    if (i < 0) fail(`No hay un pendiente abierto ${hid} en ${id}`)
    lines[i] = lines[i].replace('- [ ]', '- [x]') + ` → ✔ ${result}`
    fs.writeFileSync(p, lines.join('\n'))
    console.log(`✓ ${hid} resuelto`)
    break
  }
  case 'siguiente': {
    const id = args[0] || getActive()?.changeId
    ensureChange(id)
    const s = summarize(id)
    // 1) Pendientes abiertos primero: bloquean a otro agente.
    if (s.openHandoffs.length) {
      const h = s.openHandoffs[0]
      console.log(`DELEGAR a ${h.to}: resolver ${h.id} (${h.text}). Pedido por ${h.from}.`)
      break
    }
    // 2) Orden del flujo: backend-dev → (test-engineer ‖ frontend-dev) → test-engineer (verificación).
    const pending = (o) => s.tasks.filter((t) => t.owner === o && !t.done)
    // Las pruebas de escenarios pueden escribirse en paralelo con la UI; el resto de "Verificación" va al final.
    const isVerification = (t) => /verificaci/i.test(t.section) && !/escenarios/i.test(t.text)
    const back = pending('backend-dev')
    const front = pending('frontend-dev')
    const testsNoVerif = pending('test-engineer').filter((t) => !isVerification(t))
    const verif = pending('test-engineer').filter(isVerification)
    if (back.length) console.log(`DELEGAR a backend-dev: ${back.map((t) => t.text).join(' | ')}`)
    else if (front.length || testsNoVerif.length) {
      if (front.length) console.log(`DELEGAR a frontend-dev: ${front.map((t) => t.text).join(' | ')}`)
      if (testsNoVerif.length) console.log(`DELEGAR a test-engineer: ${testsNoVerif.map((t) => t.text).join(' | ')}`)
      if (front.length && testsNoVerif.length) console.log('(Pueden ejecutarse en paralelo.)')
    } else if (verif.length) console.log(`DELEGAR a test-engineer (verificación final): ${verif.map((t) => t.text).join(' | ')}`)
    else if (s.tasks.some((t) => !t.done)) {
      const rest = s.tasks.filter((t) => !t.done)
      console.log(`PRINCIPAL: tareas sin responsable → ${rest.map((t) => t.text).join(' | ')}`)
    } else console.log(`LISTO: todas las tareas y pendientes de ${id} están cerrados. Ejecutar spec-reviewer y luego /openspec:archive ${id}.`)
    break
  }
  default:
    console.log(
      'Uso: orquestacion.mjs estado [--activo] | iniciar <id> | terminar | pendiente <id> <de> <para> "<texto>" | resolver <id> <H-###> "<resultado>" | siguiente [<id>]',
    )
}

// Utilidades compartidas de orquestación: leen tasks.md y handoffs.md de los changes activos
// y el change que se está implementando (.claude/state/cambio-activo.json).
// Sin dependencias externas: solo Node.js (>= 18).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = process.env.CLAUDE_PROJECT_DIR || path.resolve(here, '..', '..', '..')
export const CHANGES_DIR = path.join(ROOT, 'openspec', 'changes')
export const STATE_FILE = path.join(ROOT, '.claude', 'state', 'cambio-activo.json')

export const AGENTES = ['backend-dev', 'frontend-dev', 'test-engineer', 'principal']

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '')

/** Changes activos (no archivados), ordenados por nombre. */
export function listChanges() {
  if (!fs.existsSync(CHANGES_DIR)) return []
  return fs
    .readdirSync(CHANGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'archive' && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort()
}

/** Tareas de tasks.md agrupadas por responsable (según "## N. Sección · agente"). */
export function readTasks(changeId) {
  const text = read(path.join(CHANGES_DIR, changeId, 'tasks.md'))
  const tasks = []
  let owner = 'principal'
  let section = ''
  for (const line of text.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.+?)(?:\s+·\s+([\w-]+))?\s*$/)
    if (h) {
      section = h[1].trim()
      owner = h[2] || 'principal'
      continue
    }
    const t = line.match(/^\s*- \[( |x|X)\]\s+(.*)$/)
    if (t) tasks.push({ done: t[1].toLowerCase() === 'x', text: t[2].trim(), owner, section })
  }
  return tasks
}

const HANDOFF_RE = /^- \[( |x|X)\]\s+(H-\d{3})\s+·\s+de:\s*([\w-]+)\s+·\s+para:\s*([\w-]+)\s+·\s+(.*)$/

/** Pendientes entre agentes de handoffs.md. */
export function readHandoffs(changeId) {
  const text = read(path.join(CHANGES_DIR, changeId, 'handoffs.md'))
  return text
    .split(/\r?\n/)
    .map((l) => l.match(HANDOFF_RE))
    .filter(Boolean)
    .map((m) => ({ done: m[1].toLowerCase() === 'x', id: m[2], from: m[3], to: m[4], text: m[5].trim() }))
}

export function handoffsPath(changeId) {
  return path.join(CHANGES_DIR, changeId, 'handoffs.md')
}

export function getActive() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
  } catch {
    return null
  }
}

export function setActive(changeId) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
  fs.writeFileSync(STATE_FILE, JSON.stringify({ changeId, desde: new Date().toISOString() }, null, 2))
}

export function clearActive() {
  if (fs.existsSync(STATE_FILE)) fs.rmSync(STATE_FILE)
}

/** Resumen de un change: tareas por agente y pendientes abiertos. */
export function summarize(changeId) {
  const tasks = readTasks(changeId)
  const handoffs = readHandoffs(changeId)
  const byOwner = {}
  for (const t of tasks) {
    byOwner[t.owner] ??= { done: 0, total: 0, next: null }
    byOwner[t.owner].total++
    if (t.done) byOwner[t.owner].done++
    else byOwner[t.owner].next ??= t.text
  }
  return {
    changeId,
    tasks,
    byOwner,
    done: tasks.filter((t) => t.done).length,
    total: tasks.length,
    openHandoffs: handoffs.filter((h) => !h.done),
    handoffs,
  }
}

/** Tablero en texto (lo usan /openspec:estado y el hook de inicio de sesión). */
export function renderBoard({ onlyActive = false } = {}) {
  const active = getActive()
  const ids = onlyActive ? (active ? [active.changeId] : []) : listChanges()
  const lines = []
  lines.push('== Tablero de orquestación · Cadena de Favores+ ==')
  lines.push(active ? `Change en curso: ${active.changeId} (desde ${active.desde})` : 'Change en curso: ninguno')
  for (const id of ids) {
    if (!fs.existsSync(path.join(CHANGES_DIR, id))) continue
    const s = summarize(id)
    lines.push('')
    lines.push(`• ${id}  —  ${s.done}/${s.total} tareas${active?.changeId === id ? '  [EN CURSO]' : ''}`)
    for (const [owner, o] of Object.entries(s.byOwner)) {
      lines.push(`    ${owner.padEnd(14)} ${o.done}/${o.total}${o.next ? `  → siguiente: ${o.next}` : '  ✓'}`)
    }
    if (s.openHandoffs.length) {
      lines.push(`    Pendientes abiertos (${s.openHandoffs.length}):`)
      for (const h of s.openHandoffs) lines.push(`      ${h.id} ${h.from} → ${h.to}: ${h.text}`)
    }
  }
  return lines.join('\n')
}

import type { Need, NeedType, PriorityLevel } from './types'

/**
 * Cálculo de prioridad (spec: mapa-de-prioridades, requisito "Nivel de prioridad").
 * Cuatro criterios, cada uno aporta 0–3 puntos (máximo 12):
 *  1. Tipo de necesidad: vital (techo, agua, alimento, carpas, salud) pesa más.
 *  2. Personas afectadas.
 *  3. Vulnerabilidad: niños, adultos mayores, discapacidad o enfermos.
 *  4. Tiempo de espera sin ser atendida.
 * Umbrales: alta >= 8, media >= 5, baja < 5.
 * Los pesos son una propuesta inicial; ver openspec/changes/add-mapa-prioridades/design.md.
 */

const TYPE_POINTS: Record<NeedType, number> = {
  techo: 3,
  agua: 3,
  alimento: 3,
  carpas: 3,
  salud: 3,
  transporte: 2,
  bodega: 2,
  reparacion: 2,
  mano_de_obra: 2,
  equipos: 1,
  asesoria: 1,
  visibilidad: 0,
}

export const PRIORITY_THRESHOLDS = { alta: 8, media: 5 } as const

export function peoplePoints(people: number): number {
  if (people >= 10) return 3
  if (people >= 4) return 2
  if (people >= 1) return 1
  return 0
}

export function vulnerabilityPoints(count: number): number {
  if (count >= 2) return 3
  if (count === 1) return 2
  return 0
}

export function waitPoints(days: number): number {
  if (days >= 3) return 3
  if (days >= 1) return 2
  return 1
}

export function daysWaiting(createdAt: string, now: Date = new Date()): number {
  const ms = now.getTime() - new Date(createdAt).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export interface PriorityBreakdown {
  type: number
  people: number
  vulnerability: number
  wait: number
  total: number
  level: PriorityLevel
}

export function computePriority(
  need: Pick<Need, 'type' | 'peopleAffected' | 'vulnerabilities' | 'createdAt'>,
  now: Date = new Date(),
): PriorityBreakdown {
  const type = TYPE_POINTS[need.type]
  const people = peoplePoints(need.peopleAffected)
  const vulnerability = vulnerabilityPoints(new Set(need.vulnerabilities).size)
  const wait = waitPoints(daysWaiting(need.createdAt, now))
  const total = type + people + vulnerability + wait
  const level: PriorityLevel =
    total >= PRIORITY_THRESHOLDS.alta ? 'alta' : total >= PRIORITY_THRESHOLDS.media ? 'media' : 'baja'
  return { type, people, vulnerability, wait, total, level }
}

const LEVEL_ORDER: Record<PriorityLevel, number> = { alta: 0, media: 1, baja: 2 }

/**
 * Orden "Dónde hace más falta": primero sin ayuda, luego prioridad y luego más días de espera.
 */
export function sortByMostNeeded<T extends Need>(
  needs: T[],
  statusOf: (n: T) => 'sin_ayuda' | 'en_camino' | 'atendida',
  now: Date = new Date(),
): T[] {
  const statusRank = { sin_ayuda: 0, en_camino: 1, atendida: 2 } as const
  return [...needs].sort((a, b) => {
    const s = statusRank[statusOf(a)] - statusRank[statusOf(b)]
    if (s !== 0) return s
    const pa = computePriority(a, now)
    const pb = computePriority(b, now)
    const l = LEVEL_ORDER[pa.level] - LEVEL_ORDER[pb.level]
    if (l !== 0) return l
    if (pb.total !== pa.total) return pb.total - pa.total
    return daysWaiting(b.createdAt, now) - daysWaiting(a.createdAt, now)
  })
}

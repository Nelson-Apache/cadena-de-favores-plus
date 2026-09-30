import { aidStatus } from './status'
import type { Need } from './types'

/** Decisión del 2026-09-29: máximo 3 necesidades activas por usuario. */
export const MAX_ACTIVE_NEEDS = 3

export const NEED_LIMIT_MESSAGE = 'Ya tienes 3 necesidades activas. Completa o cierra una antes de publicar otra.'

/** Activa = todavía no "Atendida" (regla de `aidStatus`). */
export function isActiveNeed(need: Pick<Need, 'items'>): boolean {
  return aidStatus(need) !== 'atendida'
}

/** Cuántas necesidades activas publicó `ownerId`. */
export function countActiveNeeds(needs: Array<Pick<Need, 'items' | 'ownerId'>>, ownerId: string): number {
  return needs.filter((n) => n.ownerId === ownerId && isActiveNeed(n)).length
}

/** Se puede publicar otra necesidad mientras haya menos de 3 activas. */
export function canPublishNeed(activeCount: number): boolean {
  return activeCount < MAX_ACTIVE_NEEDS
}

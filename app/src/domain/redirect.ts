import { nearest } from './geo'
import { aidStatus } from './status'
import type { Need } from './types'

/** Necesidades "sin ayuda" (rojas) más cercanas a `need`, con su distancia en km. Excluye la propia. */
export function nearestUnattended(need: Need, needs: Need[], limit = 3): Array<Need & { distanceKm: number }> {
  return nearest(
    need,
    needs.filter((n) => aidStatus(n) === 'sin_ayuda'),
    limit,
  )
}

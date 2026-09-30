import { aidStatus, remaining } from './status'
import type { AidStatus, Commitment, Need } from './types'

/** Mensajes de error de un compromiso, listos para mostrarse en la interfaz. */
export const COMMITMENT_ERRORS = {
  item: 'Ese ítem no está en la necesidad.',
  quantity: 'Escribe una cantidad entera mayor que cero.',
  covered: 'Este ítem ya está cubierto: no hace falta más ayuda.',
} as const

export interface CommitmentResult {
  /** Necesidad con el ítem actualizado (`committed` suma la cantidad efectiva). */
  need: Need
  /** Compromiso con la cantidad efectiva (nunca mayor que lo que faltaba). */
  commitment: Commitment
  /** Cantidad que la persona quiso comprometer. */
  requested: number
  /** Cantidad que quedó comprometida. */
  effective: number
  /** `true` si se limitó porque se pidió más de lo que faltaba. */
  limited: boolean
  /** Aviso para mostrar cuando se limitó ("el resto ya no hace falta"). */
  notice?: string
  /** Estado de la ayuda tras el compromiso ("Ayuda en camino" si es parcial). */
  status: AidStatus
}

/**
 * Aplica un compromiso a una necesidad (spec: necesidades › Comprometerse).
 * Si se pide más de lo que falta, LIMITA la cantidad a lo que falta y devuelve un aviso; no falla.
 * Lanza un error en español si el ítem no existe, la cantidad no es válida o el ítem ya está cubierto.
 */
export function applyCommitment(need: Need, commitment: Commitment): CommitmentResult {
  const item = need.items.find((i) => i.label === commitment.itemLabel)
  if (!item) throw new Error(COMMITMENT_ERRORS.item)
  if (!Number.isInteger(commitment.quantity) || commitment.quantity <= 0) throw new Error(COMMITMENT_ERRORS.quantity)

  const missing = remaining(item)
  if (missing === 0) throw new Error(COMMITMENT_ERRORS.covered)

  const effective = Math.min(commitment.quantity, missing)
  const limited = effective < commitment.quantity
  const nextNeed: Need = {
    ...need,
    items: need.items.map((i) => (i === item ? { ...i, committed: i.committed + effective } : i)),
  }
  const result: CommitmentResult = {
    need: nextNeed,
    commitment: { ...commitment, quantity: effective, status: 'comprometido' },
    requested: commitment.quantity,
    effective,
    limited,
    status: aidStatus(nextNeed),
  }
  if (limited) {
    result.notice = `Solo faltaba${missing === 1 ? '' : 'n'} ${missing} ${item.unit}: tu compromiso quedó en ${missing}. El resto ya no hace falta.`
  }
  return result
}

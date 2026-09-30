import { canCoordinate } from './profile'
import type { Actor, Commitment, Need } from './types'

export const DELIVERY_ERRORS = {
  forbiddenConfirm: 'Solo quien recibió la ayuda (o un coordinador) puede confirmar la entrega.',
  forbiddenMark: 'Solo quien se comprometió puede marcar la entrega.',
  alreadyConfirmed: 'Esta entrega ya fue confirmada.',
  alreadyDelivered: 'Ya marcaste esta entrega como realizada.',
  item: 'Ese ítem no está en la necesidad.',
} as const

/** El receptor (dueño de la necesidad) o un coordinador pueden confirmar una entrega. */
export function canConfirmDelivery(need: Pick<Need, 'ownerId'>, actor: Actor): boolean {
  return canCoordinate(actor) || (need.ownerId !== undefined && need.ownerId === actor.id)
}

/** Quien ayuda marca su compromiso como entregado. */
export function markDelivered(commitment: Commitment, actor: Actor, now: Date = new Date()): Commitment {
  if (actor.id !== commitment.helperId) throw new Error(DELIVERY_ERRORS.forbiddenMark)
  if (commitment.status === 'confirmado') throw new Error(DELIVERY_ERRORS.alreadyConfirmed)
  if (commitment.status === 'entregado') throw new Error(DELIVERY_ERRORS.alreadyDelivered)
  return { ...commitment, status: 'entregado', deliveredAt: now.toISOString() }
}

/**
 * Confirma una entrega: suma la cantidad a `delivered` del ítem (con tope en lo pedido) y deja el compromiso
 * como `confirmado`. Puede confirmarse aunque quien ayuda no haya marcado la entrega. Si todos los ítems quedan
 * entregados, `aidStatus` da "atendida".
 */
export function confirmDelivery(
  need: Need,
  commitment: Commitment,
  actor: Actor,
  now: Date = new Date(),
): { need: Need; commitment: Commitment } {
  if (!canConfirmDelivery(need, actor)) throw new Error(DELIVERY_ERRORS.forbiddenConfirm)
  if (commitment.status === 'confirmado') throw new Error(DELIVERY_ERRORS.alreadyConfirmed)
  const item = need.items.find((i) => i.label === commitment.itemLabel)
  if (!item) throw new Error(DELIVERY_ERRORS.item)
  const iso = now.toISOString()
  return {
    need: {
      ...need,
      items: need.items.map((i) =>
        i === item ? { ...i, delivered: Math.min(i.requested, i.delivered + commitment.quantity) } : i,
      ),
    },
    commitment: {
      ...commitment,
      status: 'confirmado',
      deliveredAt: commitment.deliveredAt ?? iso,
      confirmedAt: iso,
      confirmedBy: actor.id,
    },
  }
}

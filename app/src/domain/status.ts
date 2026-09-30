import type { AidStatus, Need, NeedItem } from './types'

/** Totales de avance de una necesidad sumando todos sus ítems. */
export function needProgress(items: NeedItem[]) {
  const requested = items.reduce((s, i) => s + i.requested, 0)
  const committed = items.reduce((s, i) => s + Math.min(i.committed, i.requested), 0)
  const delivered = items.reduce((s, i) => s + Math.min(i.delivered, i.requested), 0)
  const committedPct = requested === 0 ? 0 : Math.round((committed / requested) * 100)
  return { requested, committed, delivered, committedPct }
}

/**
 * Estado de la ayuda.
 * - sin_ayuda: nadie se ha comprometido.
 * - atendida: todo lo pedido fue entregado y confirmado.
 * - en_camino: hay compromisos, pero falta entregar o falta cubrir.
 */
export function aidStatus(need: Pick<Need, 'items'>): AidStatus {
  const p = needProgress(need.items)
  if (p.requested > 0 && p.delivered >= p.requested) return 'atendida'
  if (p.committed === 0) return 'sin_ayuda'
  return 'en_camino'
}

/** Una necesidad deja de aceptar ofertas al estar comprometida al 100 %. */
export function acceptsOffers(need: Pick<Need, 'items'>): boolean {
  return need.items.some((i) => i.committed < i.requested)
}

/** Cuánto falta por comprometer de un ítem (nunca negativo). */
export function remaining(item: NeedItem): number {
  return Math.max(0, item.requested - item.committed)
}

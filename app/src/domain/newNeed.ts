import type { Need, NewNeedInput } from './types'

export interface NewNeedContext {
  id: string
  ownerId: string
  /** Coordenada aproximada del barrio (la pone la capa de datos; nunca una dirección exacta). */
  lat: number
  lng: number
  now?: Date
}

/** Título corto a partir de los ítems: "Carpas, Agua potable y Colchonetas". */
export function needTitle(items: NewNeedInput['items']): string {
  const labels = items.map((i) => i.label.trim()).filter(Boolean)
  if (labels.length <= 1) return labels[0] ?? 'Necesidad'
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`
}

/**
 * Construye la necesidad pública a partir del formulario ya validado.
 * Solo guarda municipio, barrio y coordenada aproximada: sin dirección exacta ni teléfono.
 * Nace "Sin ayuda": nada comprometido ni entregado.
 */
export function buildNeed(input: NewNeedInput, ctx: NewNeedContext): Need {
  return {
    id: ctx.id,
    title: needTitle(input.items),
    type: input.type,
    requester: input.requester,
    peopleAffected: input.peopleAffected,
    vulnerabilities: [...new Set(input.vulnerabilities)],
    items: input.items.map((i) => ({
      label: i.label.trim(),
      unit: i.unit.trim(),
      requested: i.requested,
      committed: 0,
      delivered: 0,
    })),
    location: { municipio: input.municipio, barrio: input.barrio.trim(), lat: ctx.lat, lng: ctx.lng },
    createdAt: (ctx.now ?? new Date()).toISOString(),
    ownerId: ctx.ownerId,
  }
}

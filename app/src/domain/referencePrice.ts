import type { HousingOffer, Municipio } from './types'

/**
 * Precio de referencia y sello "Arriendo solidario" (spec: vivienda-solidaria).
 * - Referencia = promedio de los arriendos normales registrados en el barrio.
 * - Si el barrio tiene menos de MIN_SAMPLE arriendos, se usa el municipio.
 * - Si el municipio tampoco alcanza, no hay referencia (null) y no se asigna sello por precio.
 */
export const MIN_SAMPLE = 3

export interface ReferencePrice {
  value: number
  scope: 'barrio' | 'municipio'
  sample: number
}

function average(values: number[]): number {
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length)
}

export function referencePrice(offers: HousingOffer[], municipio: Municipio, barrio?: string): ReferencePrice | null {
  const market = offers.filter((o) => o.offerType === 'arriendo_normal' && o.monthlyPrice > 0)
  const inMunicipio = market.filter((o) => o.location.municipio === municipio)
  if (barrio) {
    const inBarrio = inMunicipio.filter((o) => o.location.barrio.trim().toLowerCase() === barrio.trim().toLowerCase())
    if (inBarrio.length >= MIN_SAMPLE) {
      return { value: average(inBarrio.map((o) => o.monthlyPrice)), scope: 'barrio', sample: inBarrio.length }
    }
  }
  if (inMunicipio.length >= MIN_SAMPLE) {
    return { value: average(inMunicipio.map((o) => o.monthlyPrice)), scope: 'municipio', sample: inMunicipio.length }
  }
  return null
}

export type Seal = 'alojamiento_solidario' | 'arriendo_solidario' | null

/** Sello de la oferta: gratis => alojamiento solidario; precio bajo la referencia => arriendo solidario. */
export function sealFor(offer: Pick<HousingOffer, 'offerType' | 'monthlyPrice'>, ref: ReferencePrice | null): Seal {
  if (offer.offerType === 'gratis' || offer.monthlyPrice === 0) return 'alojamiento_solidario'
  if (ref && offer.monthlyPrice < ref.value) return 'arriendo_solidario'
  return null
}

/** Porcentaje por debajo (positivo) o por encima (negativo) de la referencia. */
export function percentBelow(price: number, ref: ReferencePrice): number {
  return Math.round(((ref.value - price) / ref.value) * 100)
}

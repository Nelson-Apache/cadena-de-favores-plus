import type { HousingRequest } from './types'

/**
 * Privacidad por diseño (spec: cuentas-y-privacidad).
 * - Ubicación pública: coordenadas redondeadas a 3 decimales (unos 100 m).
 * - Contacto (dirección exacta y teléfono): solo para las dos partes de una solicitud aceptada.
 */

/** Decimales de las coordenadas públicas: 3 decimales ≈ 110 m de latitud. */
export const PUBLIC_COORDINATE_DECIMALS = 3

const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** Devuelve la ubicación con latitud y longitud redondeadas para mostrarse en vistas públicas. */
export function roundCoordinates<T extends { lat: number; lng: number }>(loc: T): T {
  return {
    ...loc,
    lat: roundTo(loc.lat, PUBLIC_COORDINATE_DECIMALS),
    lng: roundTo(loc.lng, PUBLIC_COORDINATE_DECIMALS),
  }
}

/** Las dos partes de una solicitud: quien la pide y quien ofrece la vivienda. */
export function isRequestParty(
  request: Pick<HousingRequest, 'requesterId' | 'ownerId'>,
  viewerId: string | null | undefined,
): boolean {
  return !!viewerId && (viewerId === request.requesterId || viewerId === request.ownerId)
}

/**
 * ¿Puede `viewerId` ver el contacto de la otra parte?
 * Solo si la solicitud está aceptada por ambas partes y quien consulta es una de ellas.
 */
export function canViewContact(
  request: Pick<HousingRequest, 'status' | 'requesterId' | 'ownerId'>,
  viewerId: string | null | undefined,
): boolean {
  return request.status === 'aceptada' && isRequestParty(request, viewerId)
}

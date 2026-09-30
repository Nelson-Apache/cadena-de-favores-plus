/** Distancia en km entre dos coordenadas (fórmula de Haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Los puntos más cercanos a `origin`, excluyendo el propio, ordenados por distancia. */
export function nearest<T extends { id: string; location: { lat: number; lng: number } }>(
  origin: T,
  candidates: T[],
  limit = 3,
): Array<T & { distanceKm: number }> {
  return candidates
    .filter((c) => c.id !== origin.id)
    .map((c) => ({ ...c, distanceKm: distanceKm(origin.location, c.location) }))
    .sort((x, y) => x.distanceKm - y.distanceKm)
    .slice(0, limit)
}

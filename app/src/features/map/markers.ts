import L from 'leaflet'
import type { AidStatus } from '@/domain/types'

/**
 * Marcadores del mapa como divIcon (HTML + SVG en línea), sin imágenes ni fuentes externas.
 * Forma distinta por entidad para no depender solo del color (accesibilidad):
 *  - necesidad: pin con el color del estado
 *  - recurso Red lista: cuadrado azul con escudo
 *  - vivienda: cuadrado redondeado lila con casa
 */
const STATUS_COLOR: Record<AidStatus, string> = {
  sin_ayuda: '#D64545',
  en_camino: '#E0A100',
  atendida: '#2E9E5B',
}

const SVG = (path: string) =>
  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`
const SHIELD = SVG('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>')
const HOUSE = SVG('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>')

export function needIcon(status: AidStatus, selected = false) {
  const size = selected ? 34 : 26
  return L.divIcon({
    className: 'cdf-marker',
    html: `<span class="cdf-pin ${selected ? 'is-selected' : ''}" style="--c:${STATUS_COLOR[status]};width:${size}px;height:${size}px"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

export function resourceIcon() {
  return L.divIcon({
    className: 'cdf-marker',
    html: `<span class="cdf-square">${SHIELD}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export function housingIcon() {
  return L.divIcon({
    className: 'cdf-marker',
    html: `<span class="cdf-house">${HOUSE}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

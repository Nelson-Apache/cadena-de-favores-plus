import { describe, expect, it } from 'vitest'
import { nearestUnattended } from './redirect'
import type { Need } from './types'

const mk = (id: string, lat: number, committed: number): Need => ({
  id,
  title: id,
  type: 'agua',
  requester: 'familia',
  peopleAffected: 5,
  vulnerabilities: [],
  items: [{ label: 'x', unit: 'u', requested: 10, committed, delivered: 0 }],
  location: { municipio: 'Armenia', barrio: 'Centro', lat, lng: -75.7 },
  createdAt: '2026-09-25T00:00:00.000Z',
})

describe('nearestUnattended', () => {
  it('lista solo necesidades sin ayuda, por distancia, sin la propia y con tope', () => {
    const origin = mk('o', 4.5, 10)
    const list = [origin, mk('cerca', 4.51, 0), mk('cubierta', 4.501, 10), mk('media', 4.52, 3), mk('lejos', 4.6, 0)]
    const r = nearestUnattended(origin, list, 3)
    expect(r.map((n) => n.id)).toEqual(['cerca', 'lejos'])
    expect(r[0].distanceKm).toBeGreaterThan(0)
    expect(nearestUnattended(origin, [mk('a', 4.51, 0), mk('b', 4.52, 0)], 1)).toHaveLength(1)
  })
})

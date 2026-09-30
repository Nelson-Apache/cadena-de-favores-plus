import { distanceKm, nearest } from './geo'
import { needsReconfirmation } from './availability'

describe('geo', () => {
  it('Armenia–Calarcá está a unos 4 km', () => {
    const d = distanceKm({ lat: 4.5339, lng: -75.6811 }, { lat: 4.5297, lng: -75.6436 })
    expect(d).toBeGreaterThan(3.5)
    expect(d).toBeLessThan(5)
  })
  it('ordena por cercanía y excluye el origen', () => {
    const p = (id: string, lat: number) => ({ id, location: { lat, lng: -75.7 } })
    const res = nearest(p('o', 4.5), [p('o', 4.5), p('far', 4.9), p('near', 4.51)], 2)
    expect(res.map((r) => r.id)).toEqual(['near', 'far'])
  })
})

describe('reconfirmación de la Red lista', () => {
  it('pide confirmar a los 6 meses', () => {
    expect(needsReconfirmation('2026-01-01', new Date('2026-06-30'))).toBe(false)
    expect(needsReconfirmation('2026-01-01', new Date('2026-07-02'))).toBe(true)
  })
})

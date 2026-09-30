import { computePriority, daysWaiting, sortByMostNeeded } from './priority'
import type { AidStatus, Need } from './types'

const NOW = new Date('2026-10-01T12:00:00Z')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString()

const base: Need = {
  id: 'n1',
  title: 'x',
  type: 'techo',
  requester: 'familia',
  peopleAffected: 18,
  vulnerabilities: ['ninos', 'adultos_mayores'],
  items: [],
  createdAt: daysAgo(3),
  location: { municipio: 'Quimbaya', barrio: 'La Española', lat: 4.62, lng: -75.76 },
}

describe('prioridad', () => {
  it('techo, 18 personas, 2 vulnerabilidades y 3 días => alta (12 puntos)', () => {
    const p = computePriority(base, NOW)
    expect(p.total).toBe(12)
    expect(p.level).toBe('alta')
  })
  it('equipos para 2 personas sin vulnerables, registrada hoy => baja', () => {
    const p = computePriority(
      { ...base, type: 'equipos', peopleAffected: 2, vulnerabilities: [], createdAt: NOW.toISOString() },
      NOW,
    )
    expect(p.level).toBe('baja')
  })
  it('transporte para 5 personas, 1 día => media', () => {
    const p = computePriority(
      { ...base, type: 'transporte', peopleAffected: 5, vulnerabilities: [], createdAt: daysAgo(1) },
      NOW,
    )
    expect(p.total).toBe(6)
    expect(p.level).toBe('media')
  })
  it('la prioridad sube con el tiempo de espera', () => {
    const hoy = computePriority(
      { ...base, type: 'bodega', peopleAffected: 3, vulnerabilities: [], createdAt: NOW.toISOString() },
      NOW,
    )
    const tarde = computePriority(
      { ...base, type: 'bodega', peopleAffected: 3, vulnerabilities: [], createdAt: daysAgo(4) },
      NOW,
    )
    expect(tarde.total).toBeGreaterThan(hoy.total)
  })
  it('cuenta días completos de espera', () => {
    expect(daysWaiting(daysAgo(2.5), NOW)).toBe(2)
  })
})

describe('orden "dónde hace más falta"', () => {
  it('pone primero lo que no tiene ayuda y luego lo de mayor prioridad', () => {
    const atendida = { ...base, id: 'a' }
    const sinAyudaBaja = {
      ...base,
      id: 'b',
      type: 'visibilidad' as const,
      peopleAffected: 1,
      vulnerabilities: [],
      createdAt: NOW.toISOString(),
    }
    const sinAyudaAlta = { ...base, id: 'c' }
    const status = (n: Need): AidStatus => (n.id === 'a' ? 'atendida' : 'sin_ayuda')
    const sorted = sortByMostNeeded([atendida, sinAyudaBaja, sinAyudaAlta], status, NOW)
    expect(sorted.map((n) => n.id)).toEqual(['c', 'b', 'a'])
  })
})

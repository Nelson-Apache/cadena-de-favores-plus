import { acceptsOffers, aidStatus, needProgress, remaining } from './status'
import type { NeedItem } from './types'

const item = (requested: number, committed: number, delivered = 0): NeedItem => ({
  label: 'Carpas',
  unit: 'carpas',
  requested,
  committed,
  delivered,
})

describe('estado de la ayuda', () => {
  it('es "sin ayuda" cuando nadie se ha comprometido', () => {
    expect(aidStatus({ items: [item(5, 0)] })).toBe('sin_ayuda')
  })
  it('es "en camino" con compromisos parciales (2 de 5 carpas)', () => {
    expect(aidStatus({ items: [item(5, 2)] })).toBe('en_camino')
  })
  it('es "en camino" si está comprometida al 100 % pero no entregada', () => {
    expect(aidStatus({ items: [item(5, 5, 3)] })).toBe('en_camino')
  })
  it('es "atendida" cuando todo fue entregado', () => {
    expect(aidStatus({ items: [item(5, 5, 5), item(100, 100, 100)] })).toBe('atendida')
  })
})

describe('cierre de ofertas', () => {
  it('acepta ofertas mientras falte algo por comprometer', () => {
    expect(acceptsOffers({ items: [item(5, 5), item(10, 4)] })).toBe(true)
  })
  it('se cierra al llegar al 100 %', () => {
    expect(acceptsOffers({ items: [item(5, 5), item(10, 10)] })).toBe(false)
  })
})

describe('avance', () => {
  it('no cuenta compromisos por encima de lo pedido', () => {
    const p = needProgress([item(5, 8)])
    expect(p.committed).toBe(5)
    expect(p.committedPct).toBe(100)
  })
  it('calcula lo que falta', () => {
    expect(remaining(item(5, 2))).toBe(3)
    expect(remaining(item(5, 7))).toBe(0)
  })
})

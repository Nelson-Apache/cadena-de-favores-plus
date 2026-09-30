import { describe, expect, it } from 'vitest'
import { canConfirmDelivery, confirmDelivery, DELIVERY_ERRORS, markDelivered } from './delivery'
import { aidStatus } from './status'
import type { Actor, Commitment, Need } from './types'

const need: Need = {
  id: 'n-1',
  title: 'Carpas y agua',
  type: 'carpas',
  requester: 'familia',
  peopleAffected: 18,
  vulnerabilities: [],
  items: [
    { label: 'Carpas', unit: 'carpas', requested: 5, committed: 5, delivered: 0 },
    { label: 'Agua', unit: 'litros', requested: 100, committed: 100, delivered: 0 },
  ],
  location: { municipio: 'Quimbaya', barrio: 'La Española', lat: 4.6, lng: -75.7 },
  createdAt: '2026-09-25T00:00:00.000Z',
  ownerId: 'u-familia',
}
const commitment = (itemLabel: string, quantity: number): Commitment => ({
  id: `c-${itemLabel}`,
  needId: 'n-1',
  itemLabel,
  quantity,
  helperId: 'u-10',
  status: 'comprometido',
  createdAt: '2026-09-26T00:00:00.000Z',
})
const receptor: Actor = { id: 'u-familia', role: 'usuario' }
const coordinador: Actor = { id: 'u-coordinador', role: 'coordinador' }
const otro: Actor = { id: 'u-otro', role: 'usuario' }

describe('confirmDelivery', () => {
  it('el receptor confirma y se actualiza delivered', () => {
    const r = confirmDelivery(need, commitment('Carpas', 5), receptor)
    expect(r.need.items[0].delivered).toBe(5)
    expect(r.commitment.status).toBe('confirmado')
    expect(r.commitment.confirmedBy).toBe('u-familia')
    expect(aidStatus(r.need)).toBe('en_camino')
  })

  it('un coordinador puede confirmar por el receptor', () => {
    const r = confirmDelivery(need, commitment('Carpas', 5), coordinador)
    expect(r.commitment.confirmedBy).toBe('u-coordinador')
  })

  it('otra persona no puede confirmar; una necesidad sin dueño solo la confirma un coordinador', () => {
    expect(() => confirmDelivery(need, commitment('Carpas', 5), otro)).toThrow(DELIVERY_ERRORS.forbiddenConfirm)
    expect(canConfirmDelivery({ ownerId: undefined }, receptor)).toBe(false)
    expect(canConfirmDelivery({ ownerId: undefined }, coordinador)).toBe(true)
  })

  it('confirmar todos los ítems deja la necesidad "atendida"', () => {
    const one = confirmDelivery(need, commitment('Carpas', 5), receptor).need
    const two = confirmDelivery(one, commitment('Agua', 100), receptor).need
    expect(aidStatus(two)).toBe('atendida')
  })

  it('no confirma dos veces ni un ítem inexistente', () => {
    const done = confirmDelivery(need, commitment('Carpas', 5), receptor).commitment
    expect(() => confirmDelivery(need, done, receptor)).toThrow(DELIVERY_ERRORS.alreadyConfirmed)
    expect(() => confirmDelivery(need, commitment('Otro', 1), receptor)).toThrow(DELIVERY_ERRORS.item)
  })
})

describe('markDelivered', () => {
  it('solo quien se comprometió marca la entrega, una vez', () => {
    const helper: Actor = { id: 'u-10', role: 'usuario' }
    const c = markDelivered(commitment('Carpas', 5), helper, new Date('2026-09-29T10:00:00Z'))
    expect(c.status).toBe('entregado')
    expect(c.deliveredAt).toBe('2026-09-29T10:00:00.000Z')
    expect(() => markDelivered(commitment('Carpas', 5), otro)).toThrow(DELIVERY_ERRORS.forbiddenMark)
    expect(() => markDelivered(c, helper)).toThrow(DELIVERY_ERRORS.alreadyDelivered)
  })
})

import { describe, expect, it } from 'vitest'
import { applyCommitment, COMMITMENT_ERRORS } from './commitment'
import type { Commitment, Need } from './types'

const need: Need = {
  id: 'n-1',
  title: 'Carpas',
  type: 'carpas',
  requester: 'familia',
  peopleAffected: 18,
  vulnerabilities: ['ninos'],
  items: [{ label: 'Carpas', unit: 'carpas', requested: 5, committed: 0, delivered: 0 }],
  location: { municipio: 'Quimbaya', barrio: 'La Española', lat: 4.6, lng: -75.7 },
  createdAt: '2026-09-25T00:00:00.000Z',
}
const draft = (quantity: number, itemLabel = 'Carpas'): Commitment => ({
  id: 'c-1',
  needId: 'n-1',
  itemLabel,
  quantity,
  helperId: 'u-10',
  status: 'comprometido',
  createdAt: '2026-09-29T00:00:00.000Z',
})

describe('applyCommitment', () => {
  it('compromiso parcial: 2 de 5 carpas pasa a "en_camino"', () => {
    const r = applyCommitment(need, draft(2))
    expect(r.need.items[0].committed).toBe(2)
    expect(r.effective).toBe(2)
    expect(r.limited).toBe(false)
    expect(r.notice).toBeUndefined()
    expect(r.status).toBe('en_camino')
  })

  it('limita a lo que falta e informa que el resto no hace falta', () => {
    const partial = applyCommitment(need, draft(2)).need
    const r = applyCommitment(partial, draft(5))
    expect(r.requested).toBe(5)
    expect(r.effective).toBe(3)
    expect(r.limited).toBe(true)
    expect(r.commitment.quantity).toBe(3)
    expect(r.need.items[0].committed).toBe(5)
    expect(r.notice).toContain('3 carpas')
    expect(r.notice).toContain('El resto ya no hace falta')
  })

  it('no modifica la necesidad original', () => {
    applyCommitment(need, draft(2))
    expect(need.items[0].committed).toBe(0)
  })

  it('rechaza ítem inexistente, cantidad inválida e ítem ya cubierto', () => {
    expect(() => applyCommitment(need, draft(1, 'Otro'))).toThrow(COMMITMENT_ERRORS.item)
    expect(() => applyCommitment(need, draft(0))).toThrow(COMMITMENT_ERRORS.quantity)
    expect(() => applyCommitment(need, draft(1.5))).toThrow(COMMITMENT_ERRORS.quantity)
    const full = applyCommitment(need, draft(5)).need
    expect(() => applyCommitment(full, draft(1))).toThrow(COMMITMENT_ERRORS.covered)
  })
})

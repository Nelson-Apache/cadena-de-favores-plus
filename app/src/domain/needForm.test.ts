import { describe, expect, it } from 'vitest'
import { NEED_ERRORS, validateNewNeed } from './needForm'
import { buildNeed, needTitle } from './newNeed'
import type { NewNeedInput } from './types'

const valid: NewNeedInput = {
  requester: 'familia',
  type: 'carpas',
  items: [{ label: 'Carpas', unit: 'carpas', requested: 5 }],
  peopleAffected: 18,
  vulnerabilities: ['ninos'],
  municipio: 'Quimbaya',
  barrio: 'La Española',
}

describe('validateNewNeed', () => {
  it('acepta un formulario completo', () => {
    expect(validateNewNeed(valid)).toEqual({ ok: true, errors: {} })
  })

  it('indica cada campo faltante en español', () => {
    const r = validateNewNeed({})
    expect(r.ok).toBe(false)
    expect(r.errors).toEqual({
      requester: NEED_ERRORS.requester,
      type: NEED_ERRORS.type,
      items: NEED_ERRORS.items,
      peopleAffected: NEED_ERRORS.peopleAffected,
      municipio: NEED_ERRORS.municipio,
      barrio: NEED_ERRORS.barrio,
    })
  })

  it('exige cantidad mayor que cero en cada ítem y personas enteras', () => {
    const zero = { ...valid, items: [{ label: 'Carpas', unit: 'carpas', requested: 0 }] }
    const blank = { ...valid, items: [{ label: ' ', unit: 'x', requested: 2 }] }
    expect(validateNewNeed(zero).errors.items).toBe(NEED_ERRORS.items)
    expect(validateNewNeed(blank).errors.items).toBe(NEED_ERRORS.items)
    expect(validateNewNeed({ ...valid, peopleAffected: 0 }).errors.peopleAffected).toBe(NEED_ERRORS.peopleAffected)
    expect(validateNewNeed({ ...valid, peopleAffected: 2.5 }).ok).toBe(false)
  })

  it('rechaza ítems con el mismo nombre (sin distinguir mayúsculas, tildes ni espacios)', () => {
    const item = (label: string, requested: number) => ({ label, unit: 'u', requested })
    const withItems = (...items: ReturnType<typeof item>[]) => validateNewNeed({ ...valid, items })
    const expected = 'Cada ítem debe tener un nombre distinto: «Carpas» aparece más de una vez.'
    expect(withItems(item('Carpas', 3), item('Carpas', 4)).errors.items).toBe(expected)
    expect(withItems(item('Carpas', 3), item('  carpas ', 4)).ok).toBe(false)
    expect(withItems(item('Colchón', 1), item('COLCHON', 2)).ok).toBe(false)
    expect(withItems(item('Agua  potable', 1), item('agua potable', 2)).ok).toBe(false)
    expect(withItems(item('Carpas', 3), item('Colchonetas', 4)).ok).toBe(true)
  })

  it('el barrio no puede ser solo espacios; sin vulnerables es válido', () => {
    expect(validateNewNeed({ ...valid, barrio: '   ' }).errors.barrio).toBe(NEED_ERRORS.barrio)
    expect(validateNewNeed({ ...valid, vulnerabilities: [] }).ok).toBe(true)
  })
})

describe('buildNeed', () => {
  it('nace sin ayuda, con ubicación aproximada y sin campos privados', () => {
    const now = new Date('2026-09-29T00:00:00Z')
    const need = buildNeed(valid, { id: 'n-9', ownerId: 'u-familia', lat: 4.6, lng: -75.7, now })
    expect(need.items[0]).toMatchObject({ committed: 0, delivered: 0 })
    expect(need.ownerId).toBe('u-familia')
    expect(need.location).toEqual({ municipio: 'Quimbaya', barrio: 'La Española', lat: 4.6, lng: -75.7 })
    expect(Object.keys(need)).not.toContain('address')
    expect(Object.keys(need)).not.toContain('phone')
  })

  it('arma el título con los ítems', () => {
    const it1 = { label: 'Carpas', unit: '', requested: 1 }
    expect(needTitle([it1])).toBe('Carpas')
    expect(needTitle([it1, { ...it1, label: 'Agua' }, { ...it1, label: 'Colchonetas' }])).toBe(
      'Carpas, Agua y Colchonetas',
    )
  })
})

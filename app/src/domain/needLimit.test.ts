import { describe, expect, it } from 'vitest'
import { canPublishNeed, countActiveNeeds, isActiveNeed, MAX_ACTIVE_NEEDS } from './needLimit'

const item = (requested: number, committed: number, delivered: number) => [
  { label: 'x', unit: 'u', requested, committed, delivered },
]

describe('límite de necesidades activas', () => {
  it('permite publicar con 0, 1 o 2 activas y bloquea desde 3', () => {
    expect(MAX_ACTIVE_NEEDS).toBe(3)
    expect([0, 1, 2].map(canPublishNeed)).toEqual([true, true, true])
    expect(canPublishNeed(3)).toBe(false)
    expect(canPublishNeed(4)).toBe(false)
  })

  it('activa es toda necesidad que no está atendida', () => {
    expect(isActiveNeed({ items: item(5, 0, 0) })).toBe(true)
    expect(isActiveNeed({ items: item(5, 5, 2) })).toBe(true)
    expect(isActiveNeed({ items: item(5, 5, 5) })).toBe(false)
  })

  it('cuenta solo las activas del usuario', () => {
    const needs = [
      { ownerId: 'a', items: item(5, 0, 0) },
      { ownerId: 'a', items: item(5, 5, 5) },
      { ownerId: 'b', items: item(5, 0, 0) },
      { items: item(5, 0, 0) },
    ]
    expect(countActiveNeeds(needs, 'a')).toBe(1)
    expect(countActiveNeeds(needs, 'c')).toBe(0)
  })
})

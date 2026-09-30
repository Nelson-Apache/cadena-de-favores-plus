import { describe, expect, it } from 'vitest'
import { NeedValidationError } from '@/domain/needForm'
import { NEED_LIMIT_MESSAGE } from '@/domain/needLimit'
import type { NewNeedInput } from '@/domain/types'
import { createLocalStorageRepository } from './localStorageRepository'
import { createMockRepository } from './mockRepository'
import { createMemoryStore } from './storage'

const input: NewNeedInput = {
  requester: 'familia',
  type: 'carpas',
  items: [{ label: 'Carpas', unit: 'carpas', requested: 5 }],
  peopleAffected: 18,
  vulnerabilities: ['ninos'],
  municipio: 'Quimbaya',
  barrio: 'La Española',
}

describe('ciclo de una necesidad en el repositorio', () => {
  it('publica, compromete (limitando), confirma y deja la necesidad atendida', async () => {
    const repo = createMockRepository()
    const need = await repo.createNeed(input, 'u-nuevo')
    expect(need.ownerId).toBe('u-nuevo')
    const first = await repo.commit(need.id, 'Carpas', 2, 'u-10')
    expect(first.status).toBe('en_camino')
    const second = await repo.commit(need.id, 'Carpas', 5, 'u-10')
    expect(second.effective).toBe(3)
    const [c1, c2] = await repo.listCommitments(need.id)
    await repo.markDelivered(c1.id, { id: 'u-10', role: 'usuario' })
    await repo.confirmDelivery(c1.id, { id: 'u-nuevo', role: 'usuario' })
    const done = await repo.confirmDelivery(c2.id, { id: 'u-coordinador', role: 'coordinador' })
    expect(done.need.items[0].delivered).toBe(5)
    expect((await repo.getNeed(need.id))?.items[0].delivered).toBe(5)
  })

  it('rechaza formularios inválidos y el cuarto pedido activo', async () => {
    const repo = createMockRepository()
    await expect(repo.createNeed({ ...input, barrio: '' }, 'u-x')).rejects.toBeInstanceOf(NeedValidationError)
    for (let i = 0; i < 3; i++) await repo.createNeed(input, 'u-x')
    await expect(repo.createNeed(input, 'u-x')).rejects.toThrow(NEED_LIMIT_MESSAGE)
  })

  it('ambos adaptadores rechazan ítems con nombre repetido', async () => {
    const dup: NewNeedInput = {
      ...input,
      items: [
        { label: 'Carpas', unit: 'carpas', requested: 3 },
        { label: ' carpas ', unit: 'carpas', requested: 4 },
      ],
    }
    const local = createLocalStorageRepository(createMemoryStore())
    for (const repo of [createMockRepository(), local]) {
      await expect(repo.createNeed(dup, 'u-x')).rejects.toBeInstanceOf(NeedValidationError)
      await expect(repo.createNeed(dup, 'u-x')).rejects.toThrow('nombre distinto')
    }
  })

  it('registra reportes con motivo', async () => {
    const repo = createMockRepository()
    await expect(repo.reportNeed('n-482', '  ')).rejects.toThrow()
    const r = await repo.reportNeed('n-482', 'Parece falsa', 'u-10')
    expect(await repo.listReports()).toEqual([r])
  })
})

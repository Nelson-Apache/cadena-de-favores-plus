import { createLocalStorageRepository } from '@/data/localStorageRepository'
import { createMockRepository } from '@/data/mockRepository'
import type { Repository } from '@/data/repository'
import { createMemoryStore } from '@/data/storage'

/**
 * Suite de contrato del puerto `Repository` (tarea 4.1 de add-persistencia-local, principio de sustitución de Liskov).
 * Todo adaptador debe pasarla sin cambios: la UI puede usar cualquiera de ellos sin notar la diferencia.
 */

type RepositoryFactory = () => Repository

const ADAPTERS: [string, RepositoryFactory][] = [
  ['mockRepository', () => createMockRepository()],
  ['localStorageRepository (almacén en memoria)', () => createLocalStorageRepository(createMemoryStore())],
]

const MISSING_ID = 'no-existe'

describe.each(ADAPTERS)('Contrato de Repository · %s', (_name, createRepository) => {
  it('listNeeds devuelve las necesidades de demostración', async () => {
    const repo = createRepository()

    const needs = await repo.listNeeds()

    expect(needs.length).toBeGreaterThan(0)
  })

  it('listNeeds no repite identificadores', async () => {
    const repo = createRepository()

    const ids = (await repo.listNeeds()).map((n) => n.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('listResources solo devuelve recursos disponibles', async () => {
    const repo = createRepository()

    const resources = await repo.listResources()

    expect(resources.every((r) => r.available)).toBe(true)
  })

  it('listHousing devuelve las viviendas de demostración', async () => {
    const repo = createRepository()

    const housing = await repo.listHousing()

    expect(housing.length).toBeGreaterThan(0)
  })

  it('getNeed devuelve la misma necesidad que aparece en listNeeds', async () => {
    const repo = createRepository()
    const [first] = await repo.listNeeds()

    const found = await repo.getNeed(first.id)

    expect(found).toEqual(first)
  })

  it('getNeed devuelve undefined si el id no existe', async () => {
    const repo = createRepository()

    const found = await repo.getNeed(MISSING_ID)

    expect(found).toBeUndefined()
  })

  it('getHousing devuelve la misma vivienda que aparece en listHousing', async () => {
    const repo = createRepository()
    const [first] = await repo.listHousing()

    const found = await repo.getHousing(first.id)

    expect(found).toEqual(first)
  })

  it('getHousing devuelve undefined si el id no existe', async () => {
    const repo = createRepository()

    const found = await repo.getHousing(MISSING_ID)

    expect(found).toBeUndefined()
  })
})

describe('Contrato de Repository · equivalencia entre adaptadores', () => {
  const local = () => createLocalStorageRepository(createMemoryStore())
  const mockRepository = createMockRepository()

  it('listNeeds devuelve los mismos datos en ambos adaptadores', async () => {
    expect(await local().listNeeds()).toEqual(await mockRepository.listNeeds())
  })

  it('listResources devuelve los mismos datos en ambos adaptadores', async () => {
    expect(await local().listResources()).toEqual(await mockRepository.listResources())
  })

  it('listHousing devuelve los mismos datos en ambos adaptadores', async () => {
    expect(await local().listHousing()).toEqual(await mockRepository.listHousing())
  })

  it('getNeed devuelve la misma necesidad en ambos adaptadores', async () => {
    const [first] = await mockRepository.listNeeds()

    expect(await local().getNeed(first.id)).toEqual(await mockRepository.getNeed(first.id))
  })

  it('getHousing devuelve la misma vivienda en ambos adaptadores', async () => {
    const [first] = await mockRepository.listHousing()

    expect(await local().getHousing(first.id)).toEqual(await mockRepository.getHousing(first.id))
  })
})

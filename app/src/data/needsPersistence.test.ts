import { createSeedData, DATA_KEY, DATA_VERSION, localStateFor } from '@/data/localState'
import { createLocalStorageRepository } from '@/data/localStorageRepository'
import { createMockRepository } from '@/data/mockRepository'
import { createMemoryStore, type KeyValueStore } from '@/data/storage'
import type { NewNeedInput } from '@/domain/types'

/**
 * Persistencia de necesidades, compromisos y reportes (add-necesidades). Cierra el escenario que quedó parcial en
 * `cuentas-y-privacidad`: "Datos guardados › Recargar la página" ahora con `createNeed` real.
 * Una "recarga" es un segundo repositorio sobre el mismo almacén.
 */

const NOW = new Date('2026-09-29T12:00:00.000Z')
const clock = () => NOW
const OWNER = 'u-dueno'

const newNeed = (overrides: Partial<NewNeedInput> = {}): NewNeedInput => ({
  requester: 'familia',
  type: 'carpas',
  items: [{ label: 'Carpas', unit: 'carpas', requested: 5 }],
  peopleAffected: 18,
  vulnerabilities: ['ninos'],
  municipio: 'Quimbaya',
  barrio: 'La Española',
  ...overrides,
})

const repositoryOn = (store: KeyValueStore) => createLocalStorageRepository(store, clock)

describe('Datos guardados en el equipo', () => {
  it('Recargar la página: una necesidad registrada con createNeed sigue apareciendo tras recargar', async () => {
    const store = createMemoryStore()
    const created = await repositoryOn(store).createNeed(newNeed(), OWNER)

    const reloaded = repositoryOn(store)

    expect(await reloaded.getNeed(created.id)).toEqual(created)
    expect((await reloaded.listNeeds()).map((n) => n.id)).toContain(created.id)
  })

  it('Recargar la página: los compromisos y la entrega confirmada sobreviven a la recarga', async () => {
    const store = createMemoryStore()
    const first = repositoryOn(store)
    const created = await first.createNeed(newNeed(), OWNER)
    const { commitment } = await first.commit(created.id, 'Carpas', 5, 'u-10')
    await first.confirmDelivery(commitment.id, { id: OWNER, role: 'usuario' })

    const reloaded = repositoryOn(store)

    expect(await reloaded.listCommitments(created.id)).toMatchObject([{ id: commitment.id, status: 'confirmado' }])
    expect((await reloaded.getNeed(created.id))?.items[0]).toMatchObject({ committed: 5, delivered: 5 })
  })

  it('Recargar la página: los reportes sobreviven a la recarga', async () => {
    const store = createMemoryStore()
    const first = repositoryOn(store)
    const created = await first.createNeed(newNeed(), OWNER)
    const report = await first.reportNeed(created.id, 'Datos falsos', 'u-tercero')

    const reloaded = repositoryOn(store)

    expect(await reloaded.listReports()).toEqual([report])
  })

  it('Recargar la página: el límite de 3 necesidades activas sigue vigente tras recargar', async () => {
    const store = createMemoryStore()
    const first = repositoryOn(store)
    await first.createNeed(newNeed(), OWNER)
    await first.createNeed(newNeed(), OWNER)
    await first.createNeed(newNeed(), OWNER)

    const reloaded = repositoryOn(store)

    await expect(reloaded.createNeed(newNeed(), OWNER)).rejects.toThrow('Ya tienes 3 necesidades activas')
  })

  it('Recargar la página: los ids nuevos no chocan con los guardados', async () => {
    const store = createMemoryStore()
    const a = await repositoryOn(store).createNeed(newNeed(), OWNER)

    const b = await repositoryOn(store).createNeed(newNeed(), 'u-otro')

    expect(b.id).not.toBe(a.id)
  })

  it('Navegador sin almacenamiento: en memoria (mockRepository) lo registrado no llega a un almacén nuevo', async () => {
    const created = await createMockRepository(undefined, clock).createNeed(newNeed(), OWNER)

    const other = repositoryOn(createMemoryStore())

    expect(await other.getNeed(created.id)).toBeUndefined()
  })
})

describe('Ubicación aproximada pública', () => {
  it('Consulta pública: las coordenadas de la necesidad creada quedan con 3 decimales', async () => {
    const store = createMemoryStore()

    const created = await repositoryOn(store).createNeed(newNeed(), OWNER)
    const stored = await repositoryOn(store).getNeed(created.id)

    expect(stored?.location).toMatchObject({ lat: 4.623, lng: -75.763 })
  })

  it('Consulta pública: el JSON guardado de la necesidad no tiene dirección ni teléfono', async () => {
    const store = createMemoryStore()
    const created = await repositoryOn(store).createNeed(newNeed(), OWNER)

    const raw = localStateFor(store)
      .read()
      .needs.find((n) => n.id === created.id)

    expect(Object.keys(raw ?? {})).not.toEqual(expect.arrayContaining(['address']))
    expect(Object.keys(raw ?? {})).not.toEqual(expect.arrayContaining(['phone']))
    expect(JSON.stringify(raw)).not.toMatch(/address|phone|email|docNumber/)
  })

  it('Consulta pública: el mockRepository también entrega coordenadas con 3 decimales', async () => {
    const created = await createMockRepository(undefined, clock).createNeed(newNeed(), OWNER)

    expect({ lat: created.location.lat, lng: created.location.lng }).toEqual({ lat: 4.623, lng: -75.763 })
  })
})

describe('Avisos a la interfaz', () => {
  it('los suscriptores se avisan tras cada escritura (crear, comprometer, entregar, confirmar, reportar)', async () => {
    const store = createMemoryStore()
    const repo = repositoryOn(store)
    const listener = vi.fn()
    repo.subscribe(listener)

    const created = await repo.createNeed(newNeed(), OWNER)
    const { commitment } = await repo.commit(created.id, 'Carpas', 2, 'u-10')
    await repo.markDelivered(commitment.id, { id: 'u-10', role: 'usuario' })
    await repo.confirmDelivery(commitment.id, { id: OWNER, role: 'usuario' })
    await repo.reportNeed(created.id, 'Motivo')

    expect(listener).toHaveBeenCalledTimes(5)
  })

  it('una escritura rechazada no avisa a los suscriptores', async () => {
    const repo = repositoryOn(createMemoryStore())
    const listener = vi.fn()
    repo.subscribe(listener)

    await expect(repo.reportNeed('no-existe', 'Motivo')).rejects.toThrow()

    expect(listener).not.toHaveBeenCalled()
  })

  it('los datos leídos no se avisan: leer no dispara suscriptores', async () => {
    const repo = repositoryOn(createMemoryStore())
    const listener = vi.fn()
    repo.subscribe(listener)

    await repo.listNeeds()
    await repo.listCommitments()
    await repo.listReports()

    expect(listener).not.toHaveBeenCalled()
  })
})

describe('Versión de los datos guardados', () => {
  it('la versión actual es 2 y la clave es cdf-plus:v2', () => {
    expect({ version: DATA_VERSION, key: DATA_KEY }).toEqual({ version: 2, key: 'cdf-plus:v2' })
  })

  it('un JSON con version 1 se descarta y se resiembra con compromisos y reportes', async () => {
    const v1 = { ...createSeedData(), version: 1 } as Record<string, unknown>
    delete v1.commitments
    delete v1.reports
    const store = createMemoryStore({ [DATA_KEY]: JSON.stringify(v1) })

    const repo = repositoryOn(store)

    expect((await repo.listCommitments()).length).toBeGreaterThan(0)
    expect(await repo.listReports()).toEqual([])
  })

  it('un JSON de la clave v2 sin la colección de compromisos se resiembra completo', async () => {
    const broken = { ...createSeedData() } as Record<string, unknown>
    delete broken.commitments
    const store = createMemoryStore({ [DATA_KEY]: JSON.stringify(broken) })

    const repo = repositoryOn(store)

    expect((await repo.listCommitments()).length).toBeGreaterThan(0)
  })
})

describe('Coherencia de la semilla', () => {
  const seed = createSeedData()
  const totalOf = (needId: string, itemLabel: string, statuses: string[]) =>
    seed.commitments
      .filter((c) => c.needId === needId && c.itemLabel === itemLabel && statuses.includes(c.status))
      .reduce((sum, c) => sum + c.quantity, 0)

  it('los compromisos sembrados de cada ítem suman su committed', () => {
    const mismatches = seed.needs.flatMap((n) =>
      n.items
        .filter((i) => totalOf(n.id, i.label, ['comprometido', 'entregado', 'confirmado']) !== i.committed)
        .map((i) => `${n.id}/${i.label}`),
    )

    expect(mismatches).toEqual([])
  })

  it('los compromisos sembrados confirmados de cada ítem suman su delivered', () => {
    const mismatches = seed.needs.flatMap((n) =>
      n.items.filter((i) => totalOf(n.id, i.label, ['confirmado']) !== i.delivered).map((i) => `${n.id}/${i.label}`),
    )

    expect(mismatches).toEqual([])
  })

  it('todo compromiso sembrado apunta a una necesidad y un ítem existentes', () => {
    const orphans = seed.commitments.filter(
      (c) => !seed.needs.some((n) => n.id === c.needId && n.items.some((i) => i.label === c.itemLabel)),
    )

    expect(orphans).toEqual([])
  })

  it('los identificadores de compromisos sembrados no se repiten', () => {
    const ids = seed.commitments.map((c) => c.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('la semilla no trae reportes', () => {
    expect(seed.reports).toEqual([])
  })
})

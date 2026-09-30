import { createSeedData, localStateFor } from '@/data/localState'
import { createLocalStorageRepository } from '@/data/localStorageRepository'
import { createSessionService } from '@/data/session'
import type { KeyValueStore } from '@/data/storage'
import type { Need, NewProfileInput } from '@/domain/types'

/**
 * Tarea 4.2 de add-persistencia-local: recargar la página conserva lo registrado y "Restablecer" vuelve a los
 * datos iniciales. Una "recarga" se simula creando servicios nuevos sobre el mismo `localStorage` del navegador:
 * cada página nueva envuelve el mismo almacenamiento con un objeto `KeyValueStore` distinto, sin estado en memoria.
 */

const NOW = new Date('2026-09-29T12:00:00.000Z')

/** El `localStorage` del navegador: sobrevive a las recargas de la página. */
const createBrowserStorage = () => new Map<string, string>()

/** Lo que hace cada carga de la página: envolver el mismo almacenamiento con un almacén nuevo. */
const loadPage = (browserStorage: Map<string, string>) => {
  const store: KeyValueStore = {
    getItem: (key) => browserStorage.get(key) ?? null,
    setItem: (key, value) => void browserStorage.set(key, value),
    removeItem: (key) => void browserStorage.delete(key),
  }
  return {
    store,
    repository: createLocalStorageRepository(store),
    session: createSessionService(store, { now: () => NOW, newId: () => 'u-creado' }),
  }
}

const need = (overrides: Partial<Need> = {}): Need => ({
  id: 'n-registrada',
  title: 'Mercados para 2 familias',
  type: 'alimento',
  requester: 'familia',
  peopleAffected: 7,
  vulnerabilities: ['ninos'],
  items: [{ label: 'Mercados', unit: 'mercados', requested: 2, committed: 0, delivered: 0 }],
  location: { municipio: 'Pijao', barrio: 'Centro', lat: 4.334, lng: -75.705 },
  createdAt: NOW.toISOString(),
  ...overrides,
})

const newProfile = (overrides: Partial<NewProfileInput> = {}): NewProfileInput => ({
  name: 'Panadería El Trigal',
  docType: 'CC',
  docNumber: '1094000123',
  acceptsDataTreatment: true,
  ...overrides,
})

/**
 * Registra una necesidad escribiendo en el estado guardado. Sustituye a `repository.createNeed`,
 * que llega con el change add-necesidades.
 */
const registerNeed = (store: KeyValueStore, registered: Need) =>
  localStateFor(store).update((data) => ({ ...data, needs: [...data.needs, registered] }))

describe('Datos guardados en el equipo', () => {
  it('Recargar la página: una necesidad registrada sigue apareciendo después de recargar', async () => {
    const browserStorage = createBrowserStorage()
    registerNeed(loadPage(browserStorage).store, need())

    const reloaded = loadPage(browserStorage)

    expect(await reloaded.repository.getNeed('n-registrada')).toEqual(need())
  })

  it('Recargar la página: la necesidad registrada aparece en la lista del mapa después de recargar', async () => {
    const browserStorage = createBrowserStorage()
    registerNeed(loadPage(browserStorage).store, need())

    const reloaded = loadPage(browserStorage)

    expect((await reloaded.repository.listNeeds()).map((n) => n.id)).toContain('n-registrada')
  })

  it('Recargar la página: un perfil creado se conserva después de recargar', () => {
    const browserStorage = createBrowserStorage()
    loadPage(browserStorage).session.createProfile(newProfile())

    const reloaded = loadPage(browserStorage)

    expect(reloaded.session.listProfiles().map((p) => p.name)).toContain('Panadería El Trigal')
  })

  it('Recargar la página: la sesión iniciada se conserva después de recargar', () => {
    const browserStorage = createBrowserStorage()
    loadPage(browserStorage).session.signIn('u-comerciante')

    const reloaded = loadPage(browserStorage)

    expect(reloaded.session.getSession()?.profile.name).toBe('Martha Giraldo')
  })

  it('Recargar la página: la sesión cerrada sigue cerrada después de recargar', () => {
    const browserStorage = createBrowserStorage()
    const page = loadPage(browserStorage)
    page.session.signIn('u-comerciante')
    page.session.signOut()

    const reloaded = loadPage(browserStorage)

    expect(reloaded.session.getSession()).toBeNull()
  })

  it('Navegador sin almacenamiento: en memoria, lo registrado se pierde al recargar', async () => {
    registerNeed(loadPage(createBrowserStorage()).store, need())

    const reloadedWithoutStorage = loadPage(createBrowserStorage())

    expect(await reloadedWithoutStorage.repository.getNeed('n-registrada')).toBeUndefined()
  })
})

describe('Restablecer datos de demostración', () => {
  it('Antes de una prueba con usuarios: tras restablecer y recargar, la necesidad registrada ya no aparece', async () => {
    const browserStorage = createBrowserStorage()
    const page = loadPage(browserStorage)
    registerNeed(page.store, need())
    page.repository.reset()

    const reloaded = loadPage(browserStorage)

    expect(await reloaded.repository.getNeed('n-registrada')).toBeUndefined()
  })

  it('Antes de una prueba con usuarios: tras restablecer y recargar, se ven los datos iniciales', async () => {
    const browserStorage = createBrowserStorage()
    const page = loadPage(browserStorage)
    registerNeed(page.store, need())
    page.session.createProfile(newProfile())
    page.repository.reset()

    const reloaded = loadPage(browserStorage)

    expect(localStateFor(reloaded.store).read()).toEqual(createSeedData())
  })

  it('Antes de una prueba con usuarios: tras restablecer y recargar, el coordinador sigue con su sesión', () => {
    const browserStorage = createBrowserStorage()
    const page = loadPage(browserStorage)
    page.session.signIn('u-coordinador')
    page.repository.reset()

    const reloaded = loadPage(browserStorage)

    expect(reloaded.session.currentRole()).toBe('coordinador')
  })
})

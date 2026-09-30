import { createSeedData, localStateFor, parseStoredData, type StoredData } from '@/data/localState'
import {
  createLocalStorageRepository,
  DATA_KEY,
  DATA_VERSION,
  findSharedContact,
  resetDemoData,
  SESSION_KEY,
} from '@/data/localStorageRepository'
import { createMemoryStore, type KeyValueStore } from '@/data/storage'
import type { HousingOffer, HousingRequest, Need, Profile, Resource } from '@/domain/types'

// ---------- Fábricas locales (datos explícitos, sin depender de mockData.ts) ----------
const NOW = '2026-09-29T12:00:00.000Z'

const loc = (overrides: Partial<Need['location']> = {}): Need['location'] => ({
  municipio: 'Quimbaya',
  barrio: 'La Española',
  lat: 4.627,
  lng: -75.766,
  ...overrides,
})

const need = (overrides: Partial<Need> = {}): Need => ({
  id: 'n-prueba',
  title: 'Agua para 3 familias',
  type: 'agua',
  requester: 'familia',
  peopleAffected: 9,
  vulnerabilities: [],
  items: [{ label: 'Agua potable', unit: 'litros', requested: 60, committed: 0, delivered: 0 }],
  location: loc(),
  createdAt: NOW,
  ...overrides,
})

const resource = (overrides: Partial<Resource> = {}): Resource => ({
  id: 'r-prueba',
  type: 'bodega',
  title: 'Bodega 50 m²',
  description: 'Bodega seca.',
  location: loc({ municipio: 'Calarcá', barrio: 'Centro' }),
  ownerId: 'u-dueno',
  confirmedAt: NOW,
  available: true,
  ...overrides,
})

const housingOffer = (overrides: Partial<HousingOffer> = {}): HousingOffer => ({
  id: 'h-prueba',
  title: 'Habitación con baño',
  offerType: 'gratis',
  monthlyPrice: 0,
  capacity: { people: 2, kids: true, elderly: false, pets: false },
  availability: '1_mes',
  habitability: 'si',
  location: loc({ municipio: 'Circasia', barrio: 'Centro' }),
  ownerId: 'u-duena',
  ...overrides,
})

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'u-perfil',
  name: 'Perfil de prueba',
  docType: 'CC',
  docNumber: '1000000099',
  role: 'usuario',
  verified: true,
  demo: false,
  dataTreatmentAcceptedAt: NOW,
  createdAt: NOW,
  ...overrides,
})

const housingRequest = (overrides: Partial<HousingRequest> = {}): HousingRequest => ({
  id: 'hr-prueba',
  housingId: 'h-prueba',
  requesterId: 'u-solicitante',
  ownerId: 'u-duena',
  status: 'aceptada',
  createdAt: NOW,
  ...overrides,
})

const storedData = (overrides: Partial<StoredData> = {}): StoredData => ({
  version: DATA_VERSION,
  needs: [need()],
  resources: [resource()],
  housing: [housingOffer()],
  housingRequests: [housingRequest()],
  profiles: [
    profile({ id: 'u-solicitante', name: 'Familia Solicitante' }),
    profile({ id: 'u-duena', name: 'Dueña de la vivienda' }),
    profile({ id: 'u-otro', name: 'Otra persona' }),
    profile({ id: 'u-coord', name: 'Coordinación', role: 'coordinador' }),
  ],
  privateContacts: [
    { profileId: 'u-solicitante', name: 'Familia Solicitante', phone: '300 111 1111' },
    { profileId: 'u-duena', name: 'Dueña de la vivienda', phone: '300 222 2222' },
  ],
  privateAddresses: [{ housingId: 'h-prueba', address: 'Calle 1 # 2-3, Centro, Circasia' }],
  ...overrides,
})

const storeWith = (data: StoredData): KeyValueStore => createMemoryStore({ [DATA_KEY]: JSON.stringify(data) })

const storedIn = (store: KeyValueStore): StoredData | null => parseStoredData(store.getItem(DATA_KEY))

/** Todas las claves de un objeto, a cualquier profundidad. */
const deepKeys = (value: unknown): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([key, child]) => [key, ...deepKeys(child)])
    : []

const decimalsOf = (n: number): number => (String(n).split('.')[1] ?? '').length

const PRIVATE_KEYS = ['address', 'phone', 'email', 'docNumber']

// ---------- Escenarios ----------

describe('Datos guardados en el equipo', () => {
  it('Primera vez: con el almacén vacío se cargan los datos de demostración del Quindío', async () => {
    const repo = createLocalStorageRepository(createMemoryStore())

    const needs = await repo.listNeeds()

    expect(needs).toEqual(createSeedData().needs)
  })

  it('Primera vez: los datos de demostración quedan guardados bajo la clave versionada', async () => {
    const store = createMemoryStore()
    const repo = createLocalStorageRepository(store)

    await repo.listNeeds()

    expect(storedIn(store)).toEqual(createSeedData())
  })

  it('Primera vez: la clave guardada es cdf-plus:v1 con version 1', () => {
    expect([DATA_KEY, DATA_VERSION, SESSION_KEY]).toEqual(['cdf-plus:v1', 1, 'cdf-plus:v1:sesion'])
  })

  it('Primera vez: si ya hay datos guardados válidos, no se vuelve a sembrar', async () => {
    const custom = need({ id: 'n-guardada' })
    const repo = createLocalStorageRepository(storeWith(storedData({ needs: [custom] })))

    const needs = await repo.listNeeds()

    expect(needs).toEqual([custom])
  })

  it('Primera vez: si el JSON guardado está dañado, se vuelve a sembrar', async () => {
    const store = createMemoryStore({ [DATA_KEY]: '{esto no es JSON' })
    const repo = createLocalStorageRepository(store)

    const needs = await repo.listNeeds()

    expect(needs).toEqual(createSeedData().needs)
  })

  it('Primera vez: si la versión guardada es distinta, se descartan los datos y se vuelve a sembrar', async () => {
    const old = { ...storedData({ needs: [need({ id: 'n-version-vieja' })] }), version: 0 }
    const repo = createLocalStorageRepository(createMemoryStore({ [DATA_KEY]: JSON.stringify(old) }))

    const needs = await repo.listNeeds()

    expect(needs).toEqual(createSeedData().needs)
  })

  it('Primera vez: si falta una colección en los datos guardados, se vuelve a sembrar', async () => {
    const { profiles: _omitted, ...incomplete } = storedData({ needs: [need({ id: 'n-incompleta' })] })
    const repo = createLocalStorageRepository(createMemoryStore({ [DATA_KEY]: JSON.stringify(incomplete) }))

    const needs = await repo.listNeeds()

    expect(needs).toEqual(createSeedData().needs)
  })

  it('Navegador sin almacenamiento: si no se puede escribir, igual se muestran los datos de demostración', async () => {
    const failingStore: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => undefined,
    }
    const repo = createLocalStorageRepository(failingStore)

    const needs = await repo.listNeeds()

    expect(needs).toEqual(createSeedData().needs)
  })

  it('listResources oculta los recursos que no están disponibles', async () => {
    const data = storedData({ resources: [resource({ id: 'r-si' }), resource({ id: 'r-no', available: false })] })
    const repo = createLocalStorageRepository(storeWith(data))

    const ids = (await repo.listResources()).map((r) => r.id)

    expect(ids).toEqual(['r-si'])
  })

  it('al guardar un registro nuevo, sus coordenadas públicas quedan redondeadas a 3 decimales', () => {
    const store = storeWith(storedData({ needs: [] }))
    const precise = need({ id: 'n-precisa', location: loc({ lat: 4.623456, lng: -75.762649 }) })

    localStateFor(store).update((data) => ({ ...data, needs: [precise] }))

    expect(storedIn(store)?.needs[0].location).toEqual(loc({ lat: 4.623, lng: -75.763 }))
  })
})

describe('Restablecer datos de demostración', () => {
  it('Antes de una prueba con usuarios: se borran los registros creados', async () => {
    const store = storeWith(storedData({ needs: [need({ id: 'n-creada' })] }))
    const repo = createLocalStorageRepository(store)

    repo.reset()

    expect(await repo.getNeed('n-creada')).toBeUndefined()
  })

  it('Antes de una prueba con usuarios: se cargan de nuevo los datos iniciales', () => {
    const store = storeWith(storedData({ needs: [need({ id: 'n-creada' })] }))

    resetDemoData(store)

    expect(storedIn(store)).toEqual(createSeedData())
  })

  it('Antes de una prueba con usuarios: quedan solo los 4 perfiles de demostración', () => {
    const store = storeWith(storedData())

    resetDemoData(store)

    expect(storedIn(store)?.profiles.map((p) => p.id)).toEqual(['u-familia', 'u-comerciante', 'u-10', 'u-coordinador'])
  })

  it('Antes de una prueba con usuarios: avisa a los suscriptores para volver a cargar las vistas', () => {
    const repo = createLocalStorageRepository(createMemoryStore())
    const listener = vi.fn()
    repo.subscribe(listener)

    repo.reset()

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('un suscriptor que se da de baja ya no recibe avisos', () => {
    const repo = createLocalStorageRepository(createMemoryStore())
    const listener = vi.fn()
    const unsubscribe = repo.subscribe(listener)

    unsubscribe()
    repo.reset()

    expect(listener).not.toHaveBeenCalled()
  })

  it('restablecer no borra la clave de la sesión', () => {
    const session = JSON.stringify({ profileId: 'u-coordinador', startedAt: NOW })
    const store = createMemoryStore({ [SESSION_KEY]: session })

    resetDemoData(store)

    expect(store.getItem(SESSION_KEY)).toBe(session)
  })
})

describe('Ubicación aproximada pública', () => {
  it('Consulta pública: las necesidades no traen dirección, teléfono, correo ni documento', async () => {
    const repo = createLocalStorageRepository(createMemoryStore())

    const keys = deepKeys(await repo.listNeeds())

    expect(keys.filter((k) => PRIVATE_KEYS.includes(k))).toEqual([])
  })

  it('Consulta pública: los recursos no traen dirección, teléfono, correo ni documento', async () => {
    const repo = createLocalStorageRepository(createMemoryStore())

    const keys = deepKeys(await repo.listResources())

    expect(keys.filter((k) => PRIVATE_KEYS.includes(k))).toEqual([])
  })

  it('Consulta pública: las viviendas no traen dirección, teléfono, correo ni documento', async () => {
    const repo = createLocalStorageRepository(createMemoryStore())

    const keys = deepKeys(await repo.listHousing())

    expect(keys.filter((k) => PRIVATE_KEYS.includes(k))).toEqual([])
  })

  it('Consulta pública: la vivienda consultada no trae la dirección exacta guardada en privado', async () => {
    const repo = createLocalStorageRepository(storeWith(storedData()))

    const keys = deepKeys(await repo.getHousing('h-prueba'))

    expect(keys).not.toContain('address')
  })

  it('Consulta pública: todas las coordenadas públicas tienen como máximo 3 decimales', async () => {
    const repo = createLocalStorageRepository(createMemoryStore())
    const locations = [
      ...(await repo.listNeeds()).map((n) => n.location),
      ...(await repo.listResources()).map((r) => r.location),
      ...(await repo.listHousing()).map((h) => h.location),
    ]

    const maxDecimals = Math.max(...locations.flatMap((l) => [decimalsOf(l.lat), decimalsOf(l.lng)]))

    expect(maxDecimals).toBeLessThanOrEqual(3)
  })

  it('Consulta pública: la ubicación pública solo tiene municipio, barrio y coordenadas', async () => {
    const repo = createLocalStorageRepository(createMemoryStore())

    const keys = new Set((await repo.listNeeds()).flatMap((n) => Object.keys(n.location)))

    expect([...keys].sort()).toEqual(['barrio', 'lat', 'lng', 'municipio'])
  })
})

describe('Consentimiento para compartir contacto', () => {
  it('Aceptación mutua: quien pidió la vivienda ve el teléfono y la dirección exacta de la dueña', async () => {
    const repo = createLocalStorageRepository(storeWith(storedData()))

    const contact = await repo.getContactFor('hr-prueba', 'u-solicitante')

    expect(contact).toEqual({
      profileId: 'u-duena',
      name: 'Dueña de la vivienda',
      phone: '300 222 2222',
      address: 'Calle 1 # 2-3, Centro, Circasia',
    })
  })

  it('Aceptación mutua: la dueña ve el teléfono de quien pidió, sin dirección', async () => {
    const repo = createLocalStorageRepository(storeWith(storedData()))

    const contact = await repo.getContactFor('hr-prueba', 'u-duena')

    expect(contact).toEqual({ profileId: 'u-solicitante', name: 'Familia Solicitante', phone: '300 111 1111' })
  })

  it('Aceptación mutua: otro perfil no ve el contacto', async () => {
    const repo = createLocalStorageRepository(storeWith(storedData()))

    expect(await repo.getContactFor('hr-prueba', 'u-otro')).toBeUndefined()
  })

  it('Aceptación mutua: el coordinador tampoco ve el contacto', async () => {
    const repo = createLocalStorageRepository(storeWith(storedData()))

    expect(await repo.getContactFor('hr-prueba', 'u-coord')).toBeUndefined()
  })

  it('Aceptación mutua: sin sesión no se ve el contacto', async () => {
    const repo = createLocalStorageRepository(storeWith(storedData()))

    expect(await repo.getContactFor('hr-prueba', null)).toBeUndefined()
  })

  it('una solicitud pendiente no comparte el contacto ni con sus partes', async () => {
    const data = storedData({ housingRequests: [housingRequest({ status: 'pendiente' })] })
    const repo = createLocalStorageRepository(storeWith(data))

    expect(await repo.getContactFor('hr-prueba', 'u-solicitante')).toBeUndefined()
  })

  it('una solicitud rechazada no comparte el contacto ni con sus partes', async () => {
    const data = storedData({ housingRequests: [housingRequest({ status: 'rechazada' })] })
    const repo = createLocalStorageRepository(storeWith(data))

    expect(await repo.getContactFor('hr-prueba', 'u-duena')).toBeUndefined()
  })

  it('una solicitud que no existe no comparte nada', async () => {
    const repo = createLocalStorageRepository(storeWith(storedData()))

    expect(await repo.getContactFor('hr-no-existe', 'u-solicitante')).toBeUndefined()
  })

  it('si la otra parte no registró teléfono, se comparte solo su nombre de perfil', () => {
    const data = storedData({ privateContacts: [], privateAddresses: [] })

    const contact = findSharedContact(data, 'hr-prueba', 'u-duena')

    expect(contact).toEqual({ profileId: 'u-solicitante', name: 'Familia Solicitante' })
  })

  it('Aceptación mutua con los datos de demostración: la familia ve teléfono y dirección de la vivienda h-1', async () => {
    const repo = createLocalStorageRepository(createMemoryStore())

    const contact = await repo.getContactFor('hr-1', 'u-familia')

    expect(contact).toEqual({
      profileId: 'u-20',
      name: 'Luz Marina Arango',
      phone: '300 000 0020',
      address: 'Calle 40 # 25-10, Las Américas, Calarcá',
    })
  })

  it('con los datos de demostración, la solicitud pendiente hr-2 no comparte contacto', async () => {
    const repo = createLocalStorageRepository(createMemoryStore())

    expect(await repo.getContactFor('hr-2', 'u-familia')).toBeUndefined()
  })
})

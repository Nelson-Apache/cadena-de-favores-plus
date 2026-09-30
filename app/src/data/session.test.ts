import { SAVE_ERROR } from '@/data/localState'
import { DATA_KEY, resetDemoData, SESSION_KEY } from '@/data/localStorageRepository'
import { createSessionService, PROFILE_NOT_FOUND } from '@/data/session'
import { createMemoryStore, type KeyValueStore } from '@/data/storage'
import { PROFILE_ERRORS } from '@/domain/profile'
import type { NewProfileInput } from '@/domain/types'

const NOW = new Date('2026-09-29T12:00:00.000Z')
const NEW_ID = 'u-nuevo'

const newProfile = (overrides: Partial<NewProfileInput> = {}): NewProfileInput => ({
  name: 'Tienda La Esquina',
  docType: 'NIT',
  docNumber: '900.123.456-7',
  acceptsDataTreatment: true,
  ...overrides,
})

const createService = (store: KeyValueStore = createMemoryStore()) =>
  createSessionService(store, { now: () => NOW, newId: () => NEW_ID })

/** Almacén que se puede leer pero no deja escribir (navegador sin espacio o bloqueado). */
const readOnlyStore = (): KeyValueStore => ({
  getItem: () => null,
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
  removeItem: () => undefined,
})

describe('Inicio de sesión simulado', () => {
  it('Ingresar como comerciante: la sesión queda con el nombre del perfil "Comerciante afectado"', () => {
    const session = createService()

    session.signIn('u-comerciante')

    expect(session.getSession()?.profile.name).toBe('Martha Giraldo')
  })

  it('Ingresar como comerciante: el rol de la sesión es usuario', () => {
    const session = createService()

    session.signIn('u-comerciante')

    expect(session.currentRole()).toBe('usuario')
  })

  it('Ingresar como comerciante: la sesión se asocia al id del perfil (base para asociar sus registros)', () => {
    const session = createService()

    session.signIn('u-comerciante')

    expect(session.getSession()?.profile.id).toBe('u-comerciante')
  })

  it('Ingresar como comerciante: la sesión registra la hora de inicio', () => {
    const session = createService()

    session.signIn('u-comerciante')

    expect(session.getSession()?.startedAt).toBe(NOW.toISOString())
  })

  it('la opción "Comerciante afectado" existe entre los 4 perfiles de demostración', () => {
    const session = createService()

    const labels = session.listDemoProfiles().map((p) => p.label)

    expect(labels).toEqual(['Familia damnificada', 'Comerciante afectado', 'Empresa que ayuda', 'Coordinador'])
  })

  it('ingresar como coordinador da el rol coordinador', () => {
    const session = createService()

    session.signIn('u-coordinador')

    expect(session.currentRole()).toBe('coordinador')
  })

  it('sin sesión no hay perfil activo', () => {
    const session = createService()

    expect(session.getSession()).toBeNull()
  })

  it('sin sesión no hay rol', () => {
    const session = createService()

    expect(session.currentRole()).toBeNull()
  })

  it('ingresar con un perfil que no existe lanza un error en español', () => {
    const session = createService()

    expect(() => session.signIn('u-no-existe')).toThrow(PROFILE_NOT_FOUND)
  })

  it('cerrar sesión deja a la persona sin sesión', () => {
    const session = createService()
    session.signIn('u-comerciante')

    session.signOut()

    expect(session.getSession()).toBeNull()
  })

  it('getSession devuelve la misma referencia mientras la sesión no cambie', () => {
    const session = createService()
    session.signIn('u-comerciante')

    expect(session.getSession()).toBe(session.getSession())
  })

  it('getSession devuelve otra referencia al cambiar de perfil', () => {
    const session = createService()
    session.signIn('u-comerciante')
    const before = session.getSession()

    session.signIn('u-familia')

    expect(session.getSession()).not.toBe(before)
  })

  it('iniciar sesión avisa a los suscriptores', () => {
    const session = createService()
    const listener = vi.fn()
    session.subscribe(listener)

    session.signIn('u-comerciante')

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('cerrar sesión avisa a los suscriptores', () => {
    const session = createService()
    session.signIn('u-comerciante')
    const listener = vi.fn()
    session.subscribe(listener)

    session.signOut()

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('una sesión guardada con JSON dañado se ignora', () => {
    const session = createService(createMemoryStore({ [SESSION_KEY]: '{dañado' }))

    expect(session.getSession()).toBeNull()
  })

  it('una sesión guardada de un perfil que ya no existe se ignora', () => {
    const stored = JSON.stringify({ profileId: 'u-borrado', startedAt: NOW.toISOString() })
    const session = createService(createMemoryStore({ [SESSION_KEY]: stored }))

    expect(session.getSession()).toBeNull()
  })

  it('si el navegador no deja guardar la sesión, signIn lanza el aviso de guardado', () => {
    const session = createService(readOnlyStore())

    expect(() => session.signIn('u-comerciante')).toThrow(SAVE_ERROR)
  })
})

describe('Tratamiento de datos (Ley 1581 de 2012)', () => {
  it('Crear perfil: sin marcar la autorización el sistema no crea el perfil', () => {
    const session = createService()

    const result = session.createProfile(newProfile({ acceptsDataTreatment: false }))

    expect(result.ok).toBe(false)
  })

  it('Crear perfil: sin marcar la autorización indica que la autorización es obligatoria', () => {
    const session = createService()

    const result = session.createProfile(newProfile({ acceptsDataTreatment: false }))

    expect(result).toEqual({ ok: false, errors: { acceptsDataTreatment: PROFILE_ERRORS.acceptsDataTreatment } })
  })

  it('Crear perfil: sin marcar la autorización la lista de perfiles no cambia', () => {
    const session = createService()
    const before = session.listProfiles()

    session.createProfile(newProfile({ acceptsDataTreatment: false }))

    expect(session.listProfiles()).toEqual(before)
  })

  it('Crear perfil: sin marcar la autorización no se escribe nada en el almacén', () => {
    const store = createMemoryStore()
    const session = createService(store)
    session.listProfiles()
    const before = store.getItem(DATA_KEY)

    session.createProfile(newProfile({ acceptsDataTreatment: false }))

    expect(store.getItem(DATA_KEY)).toBe(before)
  })

  it('Crear perfil: con la autorización se crea con rol usuario y documento verificado (simulado)', () => {
    const session = createService()

    const result = session.createProfile(newProfile())

    expect(result).toEqual({
      ok: true,
      profile: {
        id: NEW_ID,
        name: 'Tienda La Esquina',
        docType: 'NIT',
        docNumber: '900.123.456-7',
        role: 'usuario',
        verified: true,
        demo: false,
        dataTreatmentAcceptedAt: NOW.toISOString(),
        createdAt: NOW.toISOString(),
      },
    })
  })

  it('Crear perfil: el perfil creado queda en la lista de perfiles', () => {
    const session = createService()

    session.createProfile(newProfile())

    expect(session.listProfiles().map((p) => p.id)).toContain(NEW_ID)
  })

  it('Crear perfil: crear un perfil no inicia sesión por sí solo', () => {
    const session = createService()

    session.createProfile(newProfile())

    expect(session.getSession()).toBeNull()
  })

  it('Crear perfil: se puede ingresar con el perfil recién creado', () => {
    const session = createService()
    session.createProfile(newProfile())

    session.signIn(NEW_ID)

    expect(session.getSession()?.profile.name).toBe('Tienda La Esquina')
  })

  it('Crear perfil: el nombre y el documento se guardan sin espacios sobrantes', () => {
    const session = createService()

    const result = session.createProfile(newProfile({ name: '  Tienda La Esquina  ', docNumber: ' 900123456-7 ' }))

    expect(result).toMatchObject({ ok: true, profile: { name: 'Tienda La Esquina', docNumber: '900123456-7' } })
  })

  it('Crear perfil: crear un perfil avisa a los suscriptores', () => {
    const session = createService()
    const listener = vi.fn()
    session.subscribe(listener)

    session.createProfile(newProfile())

    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('Restablecer datos de demostración (efecto en la sesión)', () => {
  it('Antes de una prueba con usuarios: se borran los perfiles creados', () => {
    const store = createMemoryStore()
    const session = createService(store)
    session.createProfile(newProfile())

    resetDemoData(store)

    expect(session.listProfiles().map((p) => p.id)).toEqual(['u-familia', 'u-comerciante', 'u-10', 'u-coordinador'])
  })

  it('Antes de una prueba con usuarios: la sesión de un perfil creado termina al restablecer', () => {
    const store = createMemoryStore()
    const session = createService(store)
    session.createProfile(newProfile())
    session.signIn(NEW_ID)

    resetDemoData(store)

    expect(session.getSession()).toBeNull()
  })

  it('Antes de una prueba con usuarios: la sesión del coordinador se conserva al restablecer', () => {
    const store = createMemoryStore()
    const session = createService(store)
    session.signIn('u-coordinador')

    resetDemoData(store)

    expect(session.currentRole()).toBe('coordinador')
  })

  it('Antes de una prueba con usuarios: restablecer avisa a los suscriptores de la sesión', () => {
    const store = createMemoryStore()
    const session = createService(store)
    const listener = vi.fn()
    session.subscribe(listener)

    resetDemoData(store)

    expect(listener).toHaveBeenCalledTimes(1)
  })
})

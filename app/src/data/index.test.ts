/**
 * Módulo `@/data` (repositorio activo de la app). Se importa de nuevo en cada prueba porque elige el almacén
 * al cargarse: así cada prueba decide si el navegador permite guardar o no.
 */

/** `localStorage` de un navegador que sí guarda. */
const workingLocalStorage = () => {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  }
}

/** `localStorage` de un navegador que no deja guardar (modo privado o almacenamiento bloqueado). */
const blockedLocalStorage = () => ({
  getItem: () => null,
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
  removeItem: () => undefined,
})

const loadDataModule = async (localStorage: unknown) => {
  vi.stubGlobal('localStorage', localStorage)
  vi.resetModules()
  return import('@/data')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Datos guardados en el equipo', () => {
  it('con localStorage disponible, los datos se guardan en el navegador', async () => {
    const data = await loadDataModule(workingLocalStorage())

    expect([data.dataSource, data.isPersistent]).toEqual(['navegador', true])
  })

  it('Navegador sin almacenamiento: la plataforma funciona en memoria y lo indica para mostrar el aviso', async () => {
    const data = await loadDataModule(blockedLocalStorage())

    expect([data.dataSource, data.isPersistent]).toEqual(['memoria', false])
  })

  it('Navegador sin almacenamiento: igual se consultan las necesidades de demostración', async () => {
    const data = await loadDataModule(blockedLocalStorage())

    const needs = await data.repository.listNeeds()

    expect(needs.length).toBeGreaterThan(0)
  })

  it('Primera vez: al abrir la plataforma los datos de demostración quedan guardados en localStorage', async () => {
    const ls = workingLocalStorage()
    const data = await loadDataModule(ls)

    await data.repository.listNeeds()

    expect(ls.getItem('cdf-plus:v2')).not.toBeNull()
  })
})

describe('Roles', () => {
  it('sin sesión no se pueden restablecer los datos de demostración', async () => {
    const data = await loadDataModule(workingLocalStorage())

    expect(() => data.resetDemoData()).toThrow(data.RESET_FORBIDDEN)
  })

  it('un perfil con rol usuario no puede restablecer los datos de demostración', async () => {
    const data = await loadDataModule(workingLocalStorage())
    data.session.signIn('u-comerciante')

    expect(() => data.resetDemoData()).toThrow(data.RESET_FORBIDDEN)
  })

  it('un perfil sin rol coordinador que intenta restablecer no borra lo registrado', async () => {
    const data = await loadDataModule(workingLocalStorage())
    data.session.createProfile({
      name: 'Panadería El Trigal',
      docType: 'CC',
      docNumber: '1094000123',
      acceptsDataTreatment: true,
    })
    data.session.signIn('u-comerciante')
    const before = data.session.listProfiles()

    expect(() => data.resetDemoData()).toThrow(data.RESET_FORBIDDEN)

    expect(data.session.listProfiles()).toEqual(before)
  })
})

describe('Restablecer datos de demostración', () => {
  it('Antes de una prueba con usuarios: el coordinador borra los perfiles creados', async () => {
    const data = await loadDataModule(workingLocalStorage())
    data.session.createProfile({
      name: 'Panadería El Trigal',
      docType: 'CC',
      docNumber: '1094000123',
      acceptsDataTreatment: true,
    })
    data.session.signIn('u-coordinador')

    data.resetDemoData()

    expect(data.session.listProfiles().map((p) => p.id)).toEqual([
      'u-familia',
      'u-comerciante',
      'u-10',
      'u-coordinador',
    ])
  })

  it('Antes de una prueba con usuarios: el coordinador sigue con su sesión después de restablecer', async () => {
    const data = await loadDataModule(workingLocalStorage())
    data.session.signIn('u-coordinador')

    data.resetDemoData()

    expect(data.session.currentRole()).toBe('coordinador')
  })

  it('Antes de una prueba con usuarios: restablecer avisa a las vistas para volver a cargar', async () => {
    const data = await loadDataModule(workingLocalStorage())
    data.session.signIn('u-coordinador')
    const listener = vi.fn()
    data.subscribeToData(listener)

    data.resetDemoData()

    expect(listener).toHaveBeenCalledTimes(1)
  })
})

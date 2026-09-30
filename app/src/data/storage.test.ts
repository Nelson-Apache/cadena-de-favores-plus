import { createBrowserStore, createMemoryStore, resolveStore } from '@/data/storage'

/** `localStorage` falso que funciona como el del navegador. */
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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createMemoryStore', () => {
  it('devuelve null para una clave que no existe', () => {
    const store = createMemoryStore()

    expect(store.getItem('clave')).toBeNull()
  })

  it('guarda y lee un valor', () => {
    const store = createMemoryStore()

    store.setItem('clave', 'valor')

    expect(store.getItem('clave')).toBe('valor')
  })

  it('borra un valor', () => {
    const store = createMemoryStore({ clave: 'valor' })

    store.removeItem('clave')

    expect(store.getItem('clave')).toBeNull()
  })

  it('arranca con los valores iniciales recibidos', () => {
    const store = createMemoryStore({ clave: 'inicial' })

    expect(store.getItem('clave')).toBe('inicial')
  })

  it('dos almacenes en memoria no comparten datos', () => {
    const first = createMemoryStore()
    const second = createMemoryStore()

    first.setItem('clave', 'valor')

    expect(second.getItem('clave')).toBeNull()
  })
})

describe('Datos guardados en el equipo', () => {
  it('Navegador sin almacenamiento: si localStorage no deja escribir, createBrowserStore devuelve null', () => {
    vi.stubGlobal('localStorage', blockedLocalStorage())

    expect(createBrowserStore()).toBeNull()
  })

  it('Navegador sin almacenamiento: si no existe localStorage, createBrowserStore devuelve null', () => {
    vi.stubGlobal('localStorage', undefined)

    expect(createBrowserStore()).toBeNull()
  })

  it('Navegador sin almacenamiento: resolveStore usa la memoria', () => {
    const resolved = resolveStore(null)

    expect(resolved.source).toBe('memoria')
  })

  it('Navegador sin almacenamiento: el almacén en memoria sí permite trabajar durante la visita', () => {
    const { store } = resolveStore(null)

    store.setItem('clave', 'valor')

    expect(store.getItem('clave')).toBe('valor')
  })

  it('Navegador sin almacenamiento: al no poder escribir, resolveStore() elige la memoria', () => {
    vi.stubGlobal('localStorage', blockedLocalStorage())

    expect(resolveStore().source).toBe('memoria')
  })

  it('con localStorage disponible, resolveStore() usa el navegador', () => {
    vi.stubGlobal('localStorage', workingLocalStorage())

    expect(resolveStore().source).toBe('navegador')
  })

  it('con localStorage disponible, createBrowserStore escribe en localStorage', () => {
    const ls = workingLocalStorage()
    vi.stubGlobal('localStorage', ls)
    const store = createBrowserStore()

    store?.setItem('clave', 'valor')

    expect(ls.getItem('clave')).toBe('valor')
  })

  it('la prueba de escritura no deja rastro en localStorage', () => {
    const ls = workingLocalStorage()
    vi.stubGlobal('localStorage', ls)

    createBrowserStore()

    expect(ls.getItem('cdf-plus:prueba')).toBeNull()
  })
})

/**
 * Almacén clave-valor inyectable (change add-persistencia-local, ADR-003).
 * Es el único módulo que toca `localStorage`. En pruebas se inyecta el almacén en memoria.
 */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** Dónde quedan los datos: en el navegador (se conservan al recargar) o solo en memoria. */
export type DataSource = 'navegador' | 'memoria'

/** Almacén en memoria con la misma interfaz. Los datos se pierden al cerrar o recargar la página. */
export function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

const PROBE_KEY = 'cdf-plus:prueba'

/**
 * `localStorage` del navegador si se puede leer y escribir; `null` si no está disponible
 * (modo privado, almacenamiento bloqueado o entorno sin navegador).
 */
export function createBrowserStore(): KeyValueStore | null {
  try {
    const ls: Storage | undefined = globalThis.localStorage
    if (!ls) return null
    ls.setItem(PROBE_KEY, '1')
    ls.removeItem(PROBE_KEY)
    return {
      getItem: (key) => ls.getItem(key),
      setItem: (key, value) => ls.setItem(key, value),
      removeItem: (key) => ls.removeItem(key),
    }
  } catch {
    return null
  }
}

/** Elige el almacén: el navegador si se puede; si no, memoria (y la UI avisa que no se guardará). */
export function resolveStore(browser: KeyValueStore | null = createBrowserStore()): {
  store: KeyValueStore
  source: DataSource
} {
  return browser ? { store: browser, source: 'navegador' } : { store: createMemoryStore(), source: 'memoria' }
}

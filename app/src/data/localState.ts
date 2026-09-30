import { roundCoordinates } from '@/domain/privacy'
import type {
  Commitment,
  DemoProfile,
  HousingOffer,
  HousingRequest,
  Need,
  NeedReport,
  PrivateAddress,
  PrivateContact,
  Profile,
  Resource,
} from '@/domain/types'
import {
  commitments,
  demoProfiles,
  housing,
  housingRequests,
  needs,
  privateAddresses,
  privateContacts,
  resources,
} from './mockData'
import type { KeyValueStore } from './storage'

/**
 * Estado guardado en el navegador bajo una sola clave versionada (design.md de add-persistencia-local).
 * Si la forma de los datos cambia, se sube `DATA_VERSION`: los datos viejos se descartan y se vuelve a sembrar.
 * v2: se agregan `commitments` y `reports` (change add-necesidades); los datos v1 se resiembran.
 * Lo comparten `localStorageRepository` (datos) y `session` (perfiles) sobre el mismo `KeyValueStore`.
 */
export const DATA_VERSION = 2
export const DATA_KEY = `cdf-plus:v${DATA_VERSION}`
/** La sesión va en su propia clave para que "Restablecer datos" no cierre la sesión del coordinador. */
export const SESSION_KEY = `${DATA_KEY}:sesion`

export interface StoredData {
  version: typeof DATA_VERSION
  needs: Need[]
  resources: Resource[]
  housing: HousingOffer[]
  housingRequests: HousingRequest[]
  profiles: Profile[]
  privateContacts: PrivateContact[]
  privateAddresses: PrivateAddress[]
  commitments: Commitment[]
  reports: NeedReport[]
}

const COLLECTIONS = [
  'needs',
  'resources',
  'housing',
  'housingRequests',
  'profiles',
  'privateContacts',
  'privateAddresses',
  'commitments',
  'reports',
] as const satisfies readonly (keyof StoredData)[]

export const SAVE_ERROR =
  'No pudimos guardar los datos en este navegador. Libera espacio o restablece los datos de demostración.'

const toProfile = (p: DemoProfile): Profile => ({
  id: p.id,
  name: p.name,
  docType: p.docType,
  docNumber: p.docNumber,
  role: p.role,
  verified: p.verified,
  demo: p.demo,
  dataTreatmentAcceptedAt: p.dataTreatmentAcceptedAt,
  createdAt: p.createdAt,
})

/** Garantiza que toda ubicación pública quede redondeada a 3 decimales al guardar. */
function withPublicLocations(data: StoredData): StoredData {
  return {
    ...data,
    needs: data.needs.map((n) => ({ ...n, location: roundCoordinates(n.location) })),
    resources: data.resources.map((r) => ({ ...r, location: roundCoordinates(r.location) })),
    housing: data.housing.map((h) => ({ ...h, location: roundCoordinates(h.location) })),
  }
}

/** Datos iniciales de demostración del Quindío (copia nueva en cada llamada). */
export function createSeedData(): StoredData {
  return withPublicLocations(
    structuredClone({
      version: DATA_VERSION,
      needs,
      resources,
      housing,
      housingRequests,
      profiles: demoProfiles.map(toProfile),
      privateContacts,
      privateAddresses,
      commitments,
      reports: [],
    }),
  )
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

/** Lee el JSON guardado; `null` si no existe, está dañado o es de otra versión. */
export function parseStoredData(raw: string | null): StoredData | null {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || value.version !== DATA_VERSION) return null
    if (!COLLECTIONS.every((key) => Array.isArray(value[key]))) return null
    return value as unknown as StoredData
  } catch {
    return null
  }
}

export interface LocalState {
  /** Datos actuales (copia nueva). Si no hay datos válidos, siembra la demostración y la guarda. */
  read(): StoredData
  /** Aplica un cambio, lo guarda completo y avisa a los suscriptores. Lanza `SAVE_ERROR` si no se puede guardar. */
  update(change: (data: StoredData) => StoredData): StoredData
  /** Vuelve a los datos iniciales de demostración y avisa a los suscriptores. */
  reset(): StoredData
  subscribe(listener: () => void): () => void
  notify(): void
}

function createLocalState(store: KeyValueStore): LocalState {
  const listeners = new Set<() => void>()

  const write = (data: StoredData) => {
    try {
      store.setItem(DATA_KEY, JSON.stringify(data))
    } catch {
      throw new Error(SAVE_ERROR)
    }
  }

  const readRaw = (): string | null => {
    try {
      return store.getItem(DATA_KEY)
    } catch {
      return null
    }
  }

  const notify = () => listeners.forEach((listener) => listener())

  const read = (): StoredData => {
    const stored = parseStoredData(readRaw())
    if (stored) return stored
    const seed = createSeedData()
    try {
      write(seed)
    } catch {
      // Si no se puede guardar, igual se muestran los datos de demostración.
    }
    return seed
  }

  return {
    read,
    update: (change) => {
      const next = withPublicLocations(change(read()))
      write(next)
      notify()
      return next
    },
    reset: () => {
      const seed = createSeedData()
      write(seed)
      notify()
      return seed
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    notify,
  }
}

const states = new WeakMap<KeyValueStore, LocalState>()

/** Un único estado (y un único grupo de suscriptores) por almacén. */
export function localStateFor(store: KeyValueStore): LocalState {
  let state = states.get(store)
  if (!state) {
    state = createLocalState(store)
    states.set(store, state)
  }
  return state
}

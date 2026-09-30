import { roleOf, validateNewProfile, type ProfileErrors } from '@/domain/profile'
import type { DemoProfile, NewProfileInput, Profile, Role, Session } from '@/domain/types'
import { localStateFor, SAVE_ERROR, SESSION_KEY } from './localState'
import { demoProfiles } from './mockData'
import type { KeyValueStore } from './storage'

/**
 * Sesión simulada (spec: cuentas-y-privacidad › Inicio de sesión simulado; ADR-003).
 * Sin contraseñas ni verificación externa. Pensada para `useSyncExternalStore(session.subscribe, session.getSession)`:
 * `getSession` devuelve la misma referencia mientras la sesión y el perfil no cambien.
 */

export type CreateProfileResult = { ok: true; profile: Profile } | { ok: false; errors: ProfileErrors }

export interface SessionService {
  /** Sesión activa o `null` si nadie ha ingresado (referencia estable entre llamadas sin cambios). */
  getSession(): Session | null
  /** Rol de quien tiene la sesión, o `null` sin sesión. */
  currentRole(): Role | null
  /** Ingresa con un perfil existente (de demostración o creado). Lanza un error en español si no existe. */
  signIn(profileId: string): Profile
  signOut(): void
  /**
   * Crea un perfil con rol `usuario` y documento "verificado (simulado)". Valida la autorización de
   * tratamiento de datos (Ley 1581 de 2012): sin ella no se crea. No inicia sesión: llama a `signIn(profile.id)`.
   */
  createProfile(input: NewProfileInput): CreateProfileResult
  /** Los 4 perfiles fijos de demostración (misma referencia siempre). */
  listDemoProfiles(): readonly DemoProfile[]
  /** Todos los perfiles guardados: los de demostración y los creados (copia nueva en cada llamada). */
  listProfiles(): Profile[]
  /** Avisa al iniciar o cerrar sesión, al crear perfiles y al restablecer los datos. */
  subscribe(listener: () => void): () => void
}

export interface SessionOptions {
  now?: () => Date
  newId?: () => string
}

interface StoredSession {
  profileId: string
  startedAt: string
}

export const PROFILE_NOT_FOUND = 'No encontramos ese perfil. Elige uno de demostración o crea uno nuevo.'

const defaultNewId = () => `u-${crypto.randomUUID()}`

function parseStoredSession(raw: string | null): StoredSession | null {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return null
    const { profileId, startedAt } = value as Partial<StoredSession>
    return typeof profileId === 'string' && typeof startedAt === 'string' ? { profileId, startedAt } : null
  } catch {
    return null
  }
}

export function createSessionService(store: KeyValueStore, options: SessionOptions = {}): SessionService {
  const now = options.now ?? (() => new Date())
  const newId = options.newId ?? defaultNewId
  const state = localStateFor(store)

  let cachedKey: string | null = null
  let cachedSession: Session | null = null

  const readStoredSession = (): StoredSession | null => {
    try {
      return parseStoredSession(store.getItem(SESSION_KEY))
    } catch {
      return null
    }
  }

  const getSession = (): Session | null => {
    const stored = readStoredSession()
    const profile = stored ? state.read().profiles.find((p) => p.id === stored.profileId) : undefined
    if (!stored || !profile) {
      cachedKey = null
      cachedSession = null
      return null
    }
    const key = JSON.stringify([stored, profile])
    if (key !== cachedKey) {
      cachedKey = key
      cachedSession = { profile, startedAt: stored.startedAt }
    }
    return cachedSession
  }

  return {
    getSession,
    currentRole: () => roleOf(getSession()?.profile),
    signIn: (profileId) => {
      const profile = state.read().profiles.find((p) => p.id === profileId)
      if (!profile) throw new Error(PROFILE_NOT_FOUND)
      const session: StoredSession = { profileId, startedAt: now().toISOString() }
      try {
        store.setItem(SESSION_KEY, JSON.stringify(session))
      } catch {
        throw new Error(SAVE_ERROR)
      }
      state.notify()
      return profile
    },
    signOut: () => {
      store.removeItem(SESSION_KEY)
      state.notify()
    },
    createProfile: (input) => {
      const validation = validateNewProfile(input)
      if (!validation.ok) return { ok: false, errors: validation.errors }
      const at = now().toISOString()
      const profile: Profile = {
        id: newId(),
        name: input.name.trim(),
        docType: input.docType,
        docNumber: input.docNumber.trim(),
        role: 'usuario',
        verified: true,
        demo: false,
        dataTreatmentAcceptedAt: at,
        createdAt: at,
      }
      state.update((data) => ({ ...data, profiles: [...data.profiles, profile] }))
      return { ok: true, profile }
    },
    listDemoProfiles: () => demoProfiles,
    listProfiles: () => state.read().profiles,
    subscribe: (listener) => state.subscribe(listener),
  }
}

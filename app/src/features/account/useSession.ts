import { useSyncExternalStore } from 'react'
import { session } from '@/data'
import type { Session } from '@/domain/types'

/** Sesión simulada actual; la vista se actualiza al ingresar, cerrar sesión o restablecer los datos. */
export function useSession(): Session | null {
  return useSyncExternalStore(session.subscribe, session.getSession)
}

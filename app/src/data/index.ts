import { canCoordinate } from '@/domain/profile'
import { createLocalStorageRepository } from './localStorageRepository'
import type { PrivateContactsRepository, Repository } from './repository'
import { createSessionService, type SessionService } from './session'
import { resolveStore, type DataSource } from './storage'

/**
 * Repositorio activo de la app: `localStorageRepository` (proyecto 100 % local, ADR-003).
 * Si el navegador no permite guardar, se usa un almacén en memoria y `dataSource` vale 'memoria':
 * la UI debe avisar "Los datos no se guardarán al cerrar el navegador".
 */
const { store, source } = resolveStore()
const localRepository = createLocalStorageRepository(store)

export const dataSource: DataSource = source
/** `false` cuando los datos solo viven en memoria y se pierden al cerrar o recargar. */
export const isPersistent: boolean = source === 'navegador'

export const repository: Repository = localRepository
export const privateContacts: PrivateContactsRepository = localRepository
export const session: SessionService = createSessionService(store)

export const RESET_FORBIDDEN = 'Solo un coordinador puede restablecer los datos de demostración.'

/**
 * Restablece los datos de demostración (spec: Restablecer datos de demostración). Solo para el rol coordinador;
 * si no, lanza `RESET_FORBIDDEN`. Conserva la sesión del coordinador y avisa a los suscriptores.
 */
export function resetDemoData(): void {
  if (!canCoordinate(session.getSession()?.profile)) throw new Error(RESET_FORBIDDEN)
  localRepository.reset()
}

/** Avisa cuando cambian los datos guardados (p. ej. tras restablecer), para volver a cargar las vistas. */
export const subscribeToData = (listener: () => void): (() => void) => localRepository.subscribe(listener)

export type { DataSource, PrivateContactsRepository, Repository, SessionService }

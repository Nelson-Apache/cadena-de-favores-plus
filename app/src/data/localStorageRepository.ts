import { canViewContact } from '@/domain/privacy'
import type { SharedContact } from '@/domain/types'
import { localStateFor, type StoredData } from './localState'
import type { PrivateContactsRepository, Repository } from './repository'
import type { KeyValueStore } from './storage'

export { DATA_KEY, DATA_VERSION, SESSION_KEY } from './localState'

/**
 * Adaptador del puerto `Repository` que guarda en un `KeyValueStore` (en la app: `localStorage`).
 * Mismo contrato que `mockRepository`; la primera vez siembra los datos de `mockData.ts`.
 */
export type LocalStorageRepository = Repository &
  PrivateContactsRepository & {
    /** Vuelve a los datos iniciales de demostración (sin control de rol; la app usa `resetDemoData` de `@/data`). */
    reset(): void
    /** Avisa cada vez que cambian los datos guardados (escritura o restablecimiento). */
    subscribe(listener: () => void): () => void
  }

/** Contacto de la otra parte, solo si la solicitud está aceptada y quien consulta es una de las dos partes. */
export function findSharedContact(
  data: Pick<StoredData, 'housingRequests' | 'privateContacts' | 'privateAddresses' | 'profiles'>,
  requestId: string,
  viewerId: string | null | undefined,
): SharedContact | undefined {
  const request = data.housingRequests.find((r) => r.id === requestId)
  if (!request || !canViewContact(request, viewerId)) return undefined

  const viewerIsRequester = viewerId === request.requesterId
  const otherId = viewerIsRequester ? request.ownerId : request.requesterId
  const contact = data.privateContacts.find((c) => c.profileId === otherId)
  const name = contact?.name ?? data.profiles.find((p) => p.id === otherId)?.name ?? 'Contacto sin nombre'
  // La dirección exacta es de la vivienda: solo la recibe quien la solicitó.
  const address = viewerIsRequester
    ? data.privateAddresses.find((a) => a.housingId === request.housingId)?.address
    : undefined

  return {
    profileId: otherId,
    name,
    ...(contact ? { phone: contact.phone } : {}),
    ...(address ? { address } : {}),
  }
}

export function createLocalStorageRepository(store: KeyValueStore): LocalStorageRepository {
  const state = localStateFor(store)
  return {
    listNeeds: async () => state.read().needs,
    listResources: async () => state.read().resources.filter((r) => r.available),
    listHousing: async () => state.read().housing,
    getNeed: async (id) => state.read().needs.find((n) => n.id === id),
    getHousing: async (id) => state.read().housing.find((h) => h.id === id),
    getContactFor: async (requestId, viewerId) => findSharedContact(state.read(), requestId, viewerId),
    reset: () => resetDemoData(store),
    subscribe: (listener) => state.subscribe(listener),
  }
}

/** Borra lo registrado y vuelve a sembrar los datos de demostración; avisa a los suscriptores (datos y sesión). */
export function resetDemoData(store: KeyValueStore): void {
  localStateFor(store).reset()
}

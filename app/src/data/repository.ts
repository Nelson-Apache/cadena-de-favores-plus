import type { HousingOffer, Need, Resource, SharedContact } from '@/domain/types'

/**
 * Puerto de acceso a datos. La UI solo depende de esta interfaz.
 * Implementaciones: mockRepository (memoria) y localStorageRepository (navegador, change add-persistencia-local).
 * Spec relacionada: openspec/project.md › Arquitectura.
 */
export interface Repository {
  listNeeds(): Promise<Need[]>
  listResources(): Promise<Resource[]>
  listHousing(): Promise<HousingOffer[]>
  getNeed(id: string): Promise<Need | undefined>
  getHousing(id: string): Promise<HousingOffer | undefined>
}

/**
 * Puerto separado (segregación de interfaces) para los datos privados: dirección exacta y teléfono.
 * Spec: cuentas-y-privacidad › Consentimiento para compartir contacto.
 */
export interface PrivateContactsRepository {
  /**
   * Contacto de la otra parte de la solicitud `requestId`.
   * `undefined` si la solicitud no existe, no está aceptada o `viewerId` no es una de sus dos partes.
   */
  getContactFor(requestId: string, viewerId: string | null | undefined): Promise<SharedContact | undefined>
}

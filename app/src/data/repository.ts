import type { CommitmentResult } from '@/domain/commitment'
import type {
  Actor,
  Commitment,
  HousingOffer,
  Need,
  NeedReport,
  NewNeedInput,
  Resource,
  SharedContact,
} from '@/domain/types'

/**
 * Escrituras de necesidades (spec: necesidades). El repositorio no conoce la sesión: recibe quién actúa.
 * Los errores son `Error` con mensaje en español; `createNeed` lanza `NeedValidationError` (errores por campo)
 * si el formulario es inválido.
 */
export interface NeedsRepository {
  /** Publica una necesidad del perfil `ownerId`. Máximo 3 activas por usuario. Solo guarda ubicación aproximada. */
  createNeed(input: NewNeedInput, ownerId: string): Promise<Need>
  /**
   * Compromiso de `helperId` con `quantity` de `itemLabel`. Si se pide más de lo que falta, limita a lo que falta
   * (ver `CommitmentResult.limited` y `.notice`). Lanza si el ítem ya está cubierto.
   */
  commit(needId: string, itemLabel: string, quantity: number, helperId: string): Promise<CommitmentResult>
  /** Quien se comprometió marca su compromiso como entregado. */
  markDelivered(commitmentId: string, actor: Actor): Promise<Commitment>
  /** El receptor (dueño de la necesidad) o un coordinador confirma la entrega y se actualiza `delivered`. */
  confirmDelivery(commitmentId: string, actor: Actor): Promise<{ need: Need; commitment: Commitment }>
  /** Historial de compromisos, del más antiguo al más reciente; de una necesidad o de todas. */
  listCommitments(needId?: string): Promise<Commitment[]>
  /** Registra un reporte de publicación sospechosa. `reporterId` es opcional. */
  reportNeed(needId: string, reason: string, reporterId?: string): Promise<NeedReport>
  /** Reportes registrados, para revisión de un coordinador. */
  listReports(): Promise<NeedReport[]>
}

/**
 * Puerto de acceso a datos. La UI solo depende de esta interfaz.
 * Implementaciones: mockRepository (memoria) y localStorageRepository (navegador, change add-persistencia-local).
 * Spec relacionada: openspec/project.md › Arquitectura.
 */
export interface Repository extends NeedsRepository {
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

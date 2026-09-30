import { applyCommitment, type CommitmentResult } from '@/domain/commitment'
import { confirmDelivery, markDelivered } from '@/domain/delivery'
import { NeedValidationError, validateNewNeed } from '@/domain/needForm'
import { canPublishNeed, countActiveNeeds, NEED_LIMIT_MESSAGE } from '@/domain/needLimit'
import { buildNeed } from '@/domain/newNeed'
import { roundCoordinates } from '@/domain/privacy'
import type { Actor, Commitment, Need, NeedReport, NewNeedInput } from '@/domain/types'
import type { StoredData } from './localState'
import { MUNICIPIO_CENTER } from './mockData'

/**
 * Operaciones puras sobre necesidades, compromisos y reportes.
 * Las comparten `mockRepository` y `localStorageRepository`: así cumplen exactamente el mismo contrato (Liskov).
 * Cada función recibe los datos actuales y devuelve los nuevos junto con el resultado; lanza errores en español.
 */
export type NeedsData = Pick<StoredData, 'needs' | 'commitments' | 'reports'>
export interface Change<T> {
  data: NeedsData
  result: T
}

export const NEEDS_ERRORS = {
  owner: 'Ingresa a tu perfil para publicar una necesidad.',
  helper: 'Ingresa a tu perfil para comprometerte.',
  actor: 'Ingresa a tu perfil para continuar.',
  needNotFound: 'No encontramos esa necesidad.',
  commitmentNotFound: 'No encontramos ese compromiso.',
  reason: 'Cuéntanos el motivo del reporte.',
} as const

const nextId = (prefix: string, ids: string[]): string => {
  const max = ids.reduce((m, id) => {
    const n = Number(id.slice(prefix.length))
    return id.startsWith(prefix) && Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `${prefix}${max + 1}`
}

const replaceNeed = (needs: Need[], next: Need): Need[] => needs.map((n) => (n.id === next.id ? next : n))

const findNeed = (data: NeedsData, id: string): Need => {
  const need = data.needs.find((n) => n.id === id)
  if (!need) throw new Error(NEEDS_ERRORS.needNotFound)
  return need
}

const findCommitment = (data: NeedsData, id: string): Commitment => {
  const commitment = data.commitments.find((c) => c.id === id)
  if (!commitment) throw new Error(NEEDS_ERRORS.commitmentNotFound)
  return commitment
}

export function createNeedIn(data: NeedsData, input: NewNeedInput, ownerId: string, now: Date): Change<Need> {
  if (!ownerId) throw new Error(NEEDS_ERRORS.owner)
  const { ok, errors } = validateNewNeed(input)
  if (!ok) throw new NeedValidationError(errors)
  if (!canPublishNeed(countActiveNeeds(data.needs, ownerId))) throw new Error(NEED_LIMIT_MESSAGE)
  const [lat, lng] = MUNICIPIO_CENTER[input.municipio]
  const id = nextId(
    'n-',
    data.needs.map((n) => n.id),
  )
  const built = buildNeed(input, { id, ownerId, lat, lng, now })
  // Privacidad: la coordenada pública se redondea aquí para que createNeed y getNeed devuelvan lo mismo.
  const need: Need = { ...built, location: roundCoordinates(built.location) }
  return { data: { ...data, needs: [...data.needs, need] }, result: need }
}

export function commitIn(
  data: NeedsData,
  needId: string,
  itemLabel: string,
  quantity: number,
  helperId: string,
  now: Date,
): Change<CommitmentResult> {
  if (!helperId) throw new Error(NEEDS_ERRORS.helper)
  const need = findNeed(data, needId)
  const draft: Commitment = {
    id: nextId(
      'c-',
      data.commitments.map((c) => c.id),
    ),
    needId,
    itemLabel,
    quantity,
    helperId,
    status: 'comprometido',
    createdAt: now.toISOString(),
  }
  const result = applyCommitment(need, draft)
  return {
    data: {
      ...data,
      needs: replaceNeed(data.needs, result.need),
      commitments: [...data.commitments, result.commitment],
    },
    result,
  }
}

export function markDeliveredIn(data: NeedsData, commitmentId: string, actor: Actor, now: Date): Change<Commitment> {
  if (!actor?.id) throw new Error(NEEDS_ERRORS.actor)
  const next = markDelivered(findCommitment(data, commitmentId), actor, now)
  return { data: { ...data, commitments: data.commitments.map((c) => (c.id === next.id ? next : c)) }, result: next }
}

export function confirmDeliveryIn(
  data: NeedsData,
  commitmentId: string,
  actor: Actor,
  now: Date,
): Change<{ need: Need; commitment: Commitment }> {
  if (!actor?.id) throw new Error(NEEDS_ERRORS.actor)
  const commitment = findCommitment(data, commitmentId)
  const result = confirmDelivery(findNeed(data, commitment.needId), commitment, actor, now)
  return {
    data: {
      ...data,
      needs: replaceNeed(data.needs, result.need),
      commitments: data.commitments.map((c) => (c.id === commitmentId ? result.commitment : c)),
    },
    result,
  }
}

export function reportNeedIn(
  data: NeedsData,
  needId: string,
  reason: string,
  reporterId: string | undefined,
  now: Date,
): Change<NeedReport> {
  findNeed(data, needId)
  if (!reason.trim()) throw new Error(NEEDS_ERRORS.reason)
  const report: NeedReport = {
    id: nextId(
      'rp-',
      data.reports.map((r) => r.id),
    ),
    needId,
    reason: reason.trim(),
    ...(reporterId ? { reporterId } : {}),
    createdAt: now.toISOString(),
  }
  return { data: { ...data, reports: [...data.reports, report] }, result: report }
}

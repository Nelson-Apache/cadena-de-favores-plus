import { createSeedData, type StoredData } from './localState'
import {
  commitIn,
  confirmDeliveryIn,
  createNeedIn,
  markDeliveredIn,
  reportNeedIn,
  type Change,
  type NeedsData,
} from './needsOperations'
import type { Repository } from './repository'

/** Repositorio en memoria (estado propio, sembrado con `mockData.ts`). Cada llamada a la fábrica es independiente. */
export function createMockRepository(
  seed: StoredData = createSeedData(),
  clock: () => Date = () => new Date(),
): Repository {
  let data: StoredData = seed
  const write = <T>(change: (current: NeedsData) => Change<T>): T => {
    const { data: next, result } = change(data)
    data = { ...data, ...next }
    return result
  }

  return {
    listNeeds: async () => data.needs,
    listResources: async () => data.resources.filter((r) => r.available),
    listHousing: async () => data.housing,
    getNeed: async (id) => data.needs.find((n) => n.id === id),
    getHousing: async (id) => data.housing.find((h) => h.id === id),
    createNeed: async (input, ownerId) => write((d) => createNeedIn(d, input, ownerId, clock())),
    commit: async (needId, itemLabel, quantity, helperId) =>
      write((d) => commitIn(d, needId, itemLabel, quantity, helperId, clock())),
    markDelivered: async (commitmentId, actor) => write((d) => markDeliveredIn(d, commitmentId, actor, clock())),
    confirmDelivery: async (commitmentId, actor) => write((d) => confirmDeliveryIn(d, commitmentId, actor, clock())),
    listCommitments: async (needId) => data.commitments.filter((c) => !needId || c.needId === needId),
    reportNeed: async (needId, reason, reporterId) =>
      write((d) => reportNeedIn(d, needId, reason, reporterId, clock())),
    listReports: async () => data.reports,
  }
}

export const mockRepository: Repository = createMockRepository()

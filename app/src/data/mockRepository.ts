import type { Repository } from './repository'
import { housing, needs, resources } from './mockData'

export const mockRepository: Repository = {
  listNeeds: async () => needs,
  listResources: async () => resources.filter((r) => r.available),
  listHousing: async () => housing,
  getNeed: async (id) => needs.find((n) => n.id === id),
  getHousing: async (id) => housing.find((h) => h.id === id),
}

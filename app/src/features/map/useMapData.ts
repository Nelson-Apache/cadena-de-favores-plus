import { useMemo } from 'react'
import { repository } from '@/data'
import { computePriority, daysWaiting, sortByMostNeeded } from '@/domain/priority'
import { referencePrice, sealFor } from '@/domain/referencePrice'
import { aidStatus, needProgress } from '@/domain/status'
import type { AidStatus, HousingOffer, Municipio, Need, PriorityLevel, Resource } from '@/domain/types'
import { useAsync } from '@/lib/useAsync'
import { useDataVersion } from '@/lib/useDataVersion'

export type Layer = 'todo' | 'necesidades' | 'recursos' | 'viviendas'

export interface Filters {
  layer: Layer
  municipio: Municipio | 'todos'
  status: AidStatus | 'todos'
  priority: PriorityLevel | 'todas'
  mostNeeded: boolean
  query: string
}

export interface NeedView extends Need {
  status: AidStatus
  priority: ReturnType<typeof computePriority>
  progress: ReturnType<typeof needProgress>
  days: number
}

export interface HousingView extends HousingOffer {
  seal: ReturnType<typeof sealFor>
}

export function useMapData(filters: Filters) {
  // Vuelve a leer cuando cambian los datos guardados (p. ej. al restablecer la demostración).
  const dataVersion = useDataVersion()
  const { data, loading } = useAsync(async () => {
    const [needs, resources, housing] = await Promise.all([
      repository.listNeeds(),
      repository.listResources(),
      repository.listHousing(),
    ])
    return { needs, resources, housing }
  }, [dataVersion])

  return useMemo(() => {
    if (!data)
      return {
        loading,
        needs: [] as NeedView[],
        resources: [] as Resource[],
        housing: [] as HousingView[],
        summary: null,
      }

    const q = filters.query.trim().toLowerCase()
    const matchesPlace = (loc: { municipio: string; barrio: string }) =>
      (filters.municipio === 'todos' || loc.municipio === filters.municipio) &&
      (!q || loc.municipio.toLowerCase().includes(q) || loc.barrio.toLowerCase().includes(q))

    const allNeeds: NeedView[] = data.needs.map((n) => ({
      ...n,
      status: aidStatus(n),
      priority: computePriority(n),
      progress: needProgress(n.items),
      days: daysWaiting(n.createdAt),
    }))

    let needs = allNeeds.filter(
      (n) =>
        matchesPlace(n.location) &&
        (filters.status === 'todos' || n.status === filters.status) &&
        (filters.priority === 'todas' || n.priority.level === filters.priority),
    )
    needs = filters.mostNeeded ? sortByMostNeeded(needs, (n) => n.status).filter((n) => n.status !== 'atendida') : needs

    const resources = data.resources.filter((r) => matchesPlace(r.location))
    const housing: HousingView[] = data.housing
      .filter((h) => matchesPlace(h.location))
      .map((h) => ({ ...h, seal: sealFor(h, referencePrice(data.housing, h.location.municipio, h.location.barrio)) }))

    // Municipio que se está quedando atrás: más necesidades sin ayuda.
    const counts = new Map<string, number>()
    allNeeds
      .filter((n) => n.status === 'sin_ayuda')
      .forEach((n) => counts.set(n.location.municipio, (counts.get(n.location.municipio) ?? 0) + 1))
    const worst = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    const summary = worst ? { municipio: worst[0] as Municipio, unassisted: worst[1] } : null

    return {
      loading: false,
      needs: filters.layer === 'todo' || filters.layer === 'necesidades' ? needs : [],
      resources: filters.layer === 'todo' || filters.layer === 'recursos' ? resources : [],
      housing: filters.layer === 'todo' || filters.layer === 'viviendas' ? housing : [],
      summary,
    }
  }, [data, loading, filters])
}

import { useCallback, useMemo, useState } from 'react'
import { repository, session } from '@/data'
import { computePriority, daysWaiting } from '@/domain/priority'
import { nearestUnattended } from '@/domain/redirect'
import { acceptsOffers, aidStatus } from '@/domain/status'
import type { Actor } from '@/domain/types'
import { useSession } from '@/features/account/useSession'
import { useAsync } from '@/lib/useAsync'
import { useDataVersion } from '@/lib/useDataVersion'

/**
 * Datos de la pantalla de detalle: necesidad, compromisos, puntos cercanos sin ayuda y quién mira.
 * Vuelve a leer al cambiar los datos guardados y con `reload()` tras cada acción.
 */
export function useNeedDetail(id: string) {
  const dataVersion = useDataVersion()
  const [tick, setTick] = useState(0)
  const current = useSession()
  const { data, error } = useAsync(async () => {
    const [need, needs, commitments] = await Promise.all([
      repository.getNeed(id),
      repository.listNeeds(),
      repository.listCommitments(id),
    ])
    return { need: need ?? null, needs, commitments, now: new Date() }
  }, [id, dataVersion, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const actor: Actor | null = current ? { id: current.profile.id, role: current.profile.role } : null

  const view = useMemo(() => {
    if (!data?.need) return null
    const { need, now } = data
    return {
      need,
      status: aidStatus(need),
      open: acceptsOffers(need),
      priority: computePriority(need, now),
      days: daysWaiting(need.createdAt, now),
      nearby: nearestUnattended(need, data.needs, 3),
      commitments: [...data.commitments].reverse(),
    }
  }, [data])

  /** Nombre público de quien ayuda (nunca documento ni contacto). */
  const helperName = useCallback((helperId: string) => {
    return session.listProfiles().find((p) => p.id === helperId)?.name ?? 'Una persona solidaria'
  }, [])

  return { loading: !data && !error, failed: !!error, notFound: !!data && !data.need, view, actor, reload, helperName }
}

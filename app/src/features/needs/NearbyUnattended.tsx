import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/Badges'
import { Icon } from '@/components/ui/Icon'
import type { Need } from '@/domain/types'
import { formatKm } from '@/lib/format'

interface Props {
  municipio: string
  needs: Array<Pick<Need, 'id' | 'title' | 'location' | 'peopleAffected'> & { distanceKm: number }>
  /** Resalta el bloque cuando se redirige a quien quería ayudar a una necesidad cubierta. */
  highlight?: boolean
}

/** Hasta 3 necesidades sin ayuda más cercanas, con su distancia. */
export function NearbyUnattended({ municipio, needs, highlight = false }: Props) {
  return (
    <section
      id="puntos-cercanos"
      tabIndex={-1}
      aria-labelledby="puntos-cercanos-titulo"
      className={`rounded-card border bg-white p-5 shadow-soft focus:outline-none md:p-6 ${highlight ? 'border-primary ring-2 ring-primary' : 'border-line'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 id="puntos-cercanos-titulo" className="font-display text-headline-sm text-ink">
          Puntos cercanos sin ayuda
        </h2>
        <span className="text-sm text-ink-soft">{municipio}</span>
      </div>
      {needs.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">
          Por ahora no hay otros puntos sin ayuda cerca. Gracias por estar pendiente.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {needs.map((n) => (
            <li key={n.id}>
              <Link
                to={`/necesidades/${n.id}`}
                className="block rounded-xl border border-line bg-surface-low p-3.5 hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status="sin_ayuda" />
                  <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                    <Icon name="location_on" className="text-[16px]" />
                    {formatKm(n.distanceKm)}
                  </span>
                </span>
                <span className="mt-2 block text-sm font-semibold text-ink">{n.title}</span>
                <span className="block text-sm text-ink-soft">
                  {n.location.municipio} · {n.location.barrio} · {n.peopleAffected}{' '}
                  {n.peopleAffected === 1 ? 'persona' : 'personas'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

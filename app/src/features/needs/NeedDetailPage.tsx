import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badges'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { formatWait } from '@/lib/format'
import { NEED_TYPE_LABEL, REQUESTER_LABEL } from '@/lib/labels'
import { CommitCard } from './CommitCard'
import { CommitmentHistory } from './CommitmentHistory'
import { ItemsProgress } from './ItemsProgress'
import { NearbyUnattended } from './NearbyUnattended'
import { PriorityExplanation } from './PriorityExplanation'
import { ReportNeed } from './ReportNeed'
import { useNeedDetail } from './useNeedDetail'

const cardClass = 'rounded-card border border-line bg-white p-5 shadow-soft md:p-6'

function Message({ title, children }: { title: string; children: string }) {
  return (
    <section className="mx-auto max-w-content px-4 py-16 md:py-20 lg:px-6">
      <div className={`${cardClass} mx-auto max-w-xl md:p-8`}>
        <h1 className="font-display text-[28px] font-bold leading-tight text-ink md:text-headline-lg">{title}</h1>
        <p className="mt-3 text-ink-soft">{children}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/mapa" className="w-full sm:w-auto">
            Volver al mapa
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

/**
 * Detalle de una necesidad · spec: necesidades (detalle, comprometerse, confirmar entrega, redirigir, reportar).
 * Referencia visual: docs/design/stitch/detalle-necesidad. Es pública para ver; las acciones piden ingresar.
 * Privacidad: solo municipio y barrio; nunca dirección exacta, teléfono ni documentos.
 */
export function NeedDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const published = (location.state as { published?: boolean } | null)?.published === true
  const { loading, failed, notFound, view, actor, reload, helperName } = useNeedDetail(id)
  const [highlightNearby, setHighlightNearby] = useState(false)

  if (loading) return <p className="p-8 text-center text-ink-soft">Cargando necesidad…</p>
  if (failed) return <Message title="No pudimos cargar esta necesidad">Revisa tu conexión e intenta de nuevo.</Message>
  if (notFound || !view) {
    return (
      <Message title="No encontramos esta necesidad">
        Puede que el enlace esté incompleto. Vuelve al mapa para ver las que siguen activas.
      </Message>
    )
  }

  const { need, status, open, priority, days, nearby, commitments } = view

  const showNearby = () => {
    setHighlightNearby(true)
    requestAnimationFrame(() => document.getElementById('puntos-cercanos')?.focus())
  }

  return (
    <div className="mx-auto max-w-content px-4 py-6 md:py-10 lg:px-6">
      <Link
        to="/mapa"
        className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <Icon name="arrow_back" className="text-[16px]" /> Volver al mapa
      </Link>

      {published && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-card bg-need-done-soft p-4 text-sm font-semibold text-ink"
        >
          <Icon name="check" className="mt-0.5 text-[18px]" />
          <span>
            Tu necesidad ya está publicada y visible en el mapa.{' '}
            <Link to="/mapa" className="underline">
              Verla en el mapa
            </Link>
          </span>
        </p>
      )}

      <div className="mt-4 grid items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <header className={cardClass}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <PriorityBadge level={priority.level} />
              <span className="rounded-full bg-surface-mid px-2.5 py-1 text-xs font-semibold text-ink-soft">
                {NEED_TYPE_LABEL[need.type]}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[28px] font-bold leading-tight text-ink md:text-headline-lg">
              {need.title}
            </h1>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Icon name="location_on" className="text-[16px]" />
                {need.location.municipio} · Barrio {need.location.barrio}
                <span className="rounded bg-surface-mid px-1.5 py-0.5 text-xs">
                  ubicación aproximada, por privacidad
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="schedule" className="text-[16px]" />
                {formatWait(days)}
              </li>
              <li className="flex items-center gap-2">
                <Icon name={need.requester === 'familia' ? 'family_restroom' : 'storefront'} className="text-[16px]" />
                {REQUESTER_LABEL[need.requester]}
              </li>
            </ul>
          </header>

          <PriorityExplanation need={need} priority={priority} days={days} />
          <ItemsProgress items={need.items} />
          <CommitmentHistory
            need={need}
            commitments={commitments}
            actor={actor}
            helperName={helperName}
            onChanged={reload}
          />
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-4">
          <CommitCard
            key={need.id}
            need={need}
            helperId={actor?.id ?? null}
            open={open}
            onCommitted={reload}
            onCovered={showNearby}
          />
          <NearbyUnattended municipio={need.location.municipio} needs={nearby} highlight={highlightNearby} />
          <ReportNeed needId={need.id} reporterId={actor?.id ?? null} />
        </aside>
      </div>
    </div>
  )
}

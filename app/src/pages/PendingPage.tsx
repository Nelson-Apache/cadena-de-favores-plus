import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface Props {
  title: string
  icon: string
  change: string
  summary: string
  reference: string
}

/**
 * Pantalla reservada para una funcionalidad cuya especificación ya existe
 * pero cuyo change de OpenSpec aún no se ha aplicado.
 */
export function PendingPage({ title, icon, change, summary, reference }: Props) {
  return (
    <section className="mx-auto max-w-content px-4 py-16 lg:px-6">
      <div className="mx-auto max-w-2xl rounded-card border border-line bg-white p-8 shadow-soft md:p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name={icon} />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-need-transit">
          Especificado · pendiente de implementar
        </p>
        <h1 className="mt-1 font-display text-headline-lg text-ink">{title}</h1>
        <p className="mt-3 text-ink-soft">{summary}</p>
        <dl className="mt-6 grid gap-3 rounded-xl bg-surface-low p-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-ink">Change OpenSpec:</dt>
            <dd>
              <code className="rounded bg-white px-1.5 py-0.5">openspec/changes/{change}</code>
            </dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="font-semibold text-ink">Diseño de referencia:</dt>
            <dd>
              <code className="rounded bg-white px-1.5 py-0.5">docs/design/stitch/{reference}</code>
            </dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/mapa">Ir al mapa</ButtonLink>
          <ButtonLink to="/" variant="secondary">
            Volver al inicio
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

import { StatusBadge } from '@/components/ui/Badges'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { aidStatus, remaining } from '@/domain/status'
import type { NeedItem } from '@/domain/types'

/** Avance de cada ítem: comprometido frente a lo pedido, y cuánto ya se entregó. */
export function ItemsProgress({ items }: { items: NeedItem[] }) {
  return (
    <section className="rounded-card border border-line bg-white p-5 shadow-soft md:p-6" aria-labelledby="insumos">
      <h2 id="insumos" className="font-display text-headline-sm text-ink">
        Lo que se necesita
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Avance de lo comprometido y entregado por cada ítem.</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const missing = remaining(item)
          const status = aidStatus({ items: [item] })
          return (
            <li key={item.label} className="rounded-xl border border-line bg-surface-low p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <StatusBadge status={status} />
              </div>
              <p className="mt-1 text-sm text-ink">
                <span className="font-semibold tabular-nums">
                  {item.committed} de {item.requested} {item.unit}
                </span>{' '}
                comprometidas
                <span className="text-ink-soft">
                  {' '}
                  · {item.delivered} entregadas · {missing > 0 ? `faltan ${missing}` : 'cubierto'}
                </span>
              </p>
              <div className="mt-2">
                <ProgressBar
                  value={item.committed}
                  max={item.requested}
                  status={status}
                  label={`Avance de ${item.label}`}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

import { useState } from 'react'
import { repository } from '@/data'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { canConfirmDelivery } from '@/domain/delivery'
import type { Actor, Commitment, Need } from '@/domain/types'
import { formatDateTime } from '@/lib/format'
import { COMMITMENT_STATUS_LABEL } from '@/lib/labels'

interface Props {
  need: Pick<Need, 'ownerId' | 'items'>
  commitments: Commitment[]
  actor: Actor | null
  helperName: (helperId: string) => string
  onChanged: () => void
}

const STATUS_ICON = { comprometido: 'handshake', entregado: 'local_shipping', confirmado: 'check' } as const

/** Historial de compromisos con su estado y fecha; permite marcar y confirmar entregas. */
export function CommitmentHistory({ need, commitments, actor, helperName, onChanged }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<{ id: string; message: string } | null>(null)

  const run = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id)
    setError(null)
    try {
      await action()
      onChanged()
    } catch (e) {
      setError({ id, message: e instanceof Error ? e.message : 'No pudimos completar la acción. Intenta de nuevo.' })
    } finally {
      setBusyId(null)
    }
  }

  const unitOf = (label: string) => need.items.find((i) => i.label === label)?.unit ?? ''

  return (
    <section className="rounded-card border border-line bg-white p-5 shadow-soft md:p-6" aria-labelledby="historial">
      <h2 id="historial" className="flex items-center gap-2 font-display text-headline-sm text-ink">
        <Icon name="history" className="text-[22px] text-primary" /> Historial de compromisos
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Quién se comprometió, con qué y en qué estado va cada entrega.</p>
      {commitments.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm text-ink-soft">
          Todavía nadie se ha comprometido. Puedes ser la primera persona en ayudar.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {commitments.map((c) => {
            const canMark = actor?.id === c.helperId && c.status === 'comprometido'
            const canConfirm = !!actor && c.status !== 'confirmado' && canConfirmDelivery(need, actor)
            return (
              <li key={c.id} className="rounded-xl border border-line bg-surface-low p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{helperName(c.helperId)}</p>
                  <time dateTime={c.createdAt} className="text-sm text-ink-soft">
                    {formatDateTime(c.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-sm text-ink">
                  Se comprometió con {c.quantity} {unitOf(c.itemLabel)} de «{c.itemLabel}».
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink">
                  <Icon name={STATUS_ICON[c.status]} className="text-[14px]" />
                  {COMMITMENT_STATUS_LABEL[c.status]}
                  {c.confirmedAt && (
                    <span className="font-normal text-ink-soft"> · {formatDateTime(c.confirmedAt)}</span>
                  )}
                  {!c.confirmedAt && c.deliveredAt && (
                    <span className="font-normal text-ink-soft"> · {formatDateTime(c.deliveredAt)}</span>
                  )}
                </p>
                {(canMark || canConfirm) && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    {canMark && actor && (
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-10"
                        disabled={busyId === c.id}
                        onClick={() => run(c.id, () => repository.markDelivered(c.id, actor))}
                      >
                        <Icon name="local_shipping" className="text-[18px]" /> Marqué como entregado
                      </Button>
                    )}
                    {canConfirm && actor && (
                      <Button
                        type="button"
                        className="min-h-10"
                        disabled={busyId === c.id}
                        onClick={() => run(c.id, () => repository.confirmDelivery(c.id, actor))}
                      >
                        <Icon name="check" className="text-[18px]" /> Confirmar entrega
                      </Button>
                    )}
                  </div>
                )}
                {error?.id === c.id && (
                  <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-ink">
                    <Icon name="emergency_home" className="mt-0.5 text-[16px]" />
                    {error.message}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

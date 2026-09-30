import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { repository } from '@/data'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FieldError, fieldClass } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { signInHref } from '@/features/account/returnPath'

interface Props {
  needId: string
  /** Quién reporta; `null` si no ha ingresado. */
  reporterId: string | null
}

/** «Reportar esta publicación»: pide un motivo y lo registra para revisión de un coordinador. */
export function ReportNeed({ needId, reporterId }: Props) {
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const close = () => {
    setOpen(false)
    setError(null)
  }

  const send = async () => {
    setBusy(true)
    setError(null)
    try {
      await repository.reportNeed(needId, reason, reporterId ?? undefined)
      setSent(true)
      setReason('')
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos enviar el reporte. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <p role="status" className="flex items-start gap-2 text-sm font-semibold text-ink">
        <Icon name="check" className="mt-0.5 text-[16px]" />
        Gracias por avisar. Un coordinador revisará esta publicación.
      </p>
    )
  }

  return (
    <div>
      {reporterId ? (
        <Button type="button" variant="ghost" className="min-h-10 text-ink-soft" onClick={() => setOpen(true)}>
          <Icon name="flag" className="text-[16px]" /> Reportar esta publicación
        </Button>
      ) : (
        <ButtonLink to={signInHref(`${pathname}${search}`)} variant="ghost" className="min-h-10 text-ink-soft">
          <Icon name="flag" className="text-[16px]" /> Ingresa para reportar esta publicación
        </ButtonLink>
      )}
      <Dialog
        open={open}
        onClose={close}
        title="Reportar esta publicación"
        actions={
          <>
            <Button type="button" variant="secondary" className="min-h-11" onClick={close}>
              Cancelar
            </Button>
            <Button type="button" className="min-h-11" disabled={busy} onClick={send}>
              {busy ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </>
        }
      >
        <label htmlFor="report-reason" className="block text-sm font-semibold text-ink">
          ¿Por qué te parece sospechosa?
        </label>
        <textarea
          id="report-reason"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'report-reason-error' : undefined}
          placeholder="Cuéntanos qué viste. Un coordinador lo revisará."
          className={`mt-1.5 ${fieldClass}`}
        />
        <FieldError id="report-reason-error">{error ?? undefined}</FieldError>
      </Dialog>
    </div>
  )
}

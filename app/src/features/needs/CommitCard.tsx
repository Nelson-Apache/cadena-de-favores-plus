import { useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { repository } from '@/data'
import { Button, ButtonLink } from '@/components/ui/Button'
import { FieldError, fieldClass } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { signInHref } from '@/features/account/returnPath'
import { remaining } from '@/domain/status'
import type { Need } from '@/domain/types'

interface Props {
  need: Pick<Need, 'id' | 'items'>
  /** Quién se compromete; `null` si no ha ingresado. */
  helperId: string | null
  /** `false` cuando todo lo pedido ya está comprometido (o entregado). */
  open: boolean
  /** Se llama después de comprometerse para volver a leer los datos. */
  onCommitted: () => void
  /** Se llama cuando alguien intenta ayudar a una necesidad cubierta (para mostrar los puntos cercanos). */
  onCovered: () => void
}

/**
 * «¿Cómo quieres ayudar?»: ítem, cantidad y botón «Me comprometo».
 * Spec: necesidades › Comprometerse · Redirigir ayuda de puntos cubiertos.
 */
export function CommitCard({ need, helperId, open, onCommitted, onCovered }: Props) {
  const { pathname, search } = useLocation()
  const firstOpen = need.items.find((i) => remaining(i) > 0)
  const [label, setLabel] = useState<string>(firstOpen?.label ?? '')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [covered, setCovered] = useState(false)
  const [busy, setBusy] = useState(false)

  const selected = need.items.find((i) => i.label === label) ?? firstOpen

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!open) {
      setCovered(true)
      onCovered()
      return
    }
    const amount = Number(quantity)
    if (!selected || remaining(selected) === 0) {
      setError('Elige un ítem que todavía necesite ayuda.')
      return
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Escribe una cantidad entera mayor que cero.')
      return
    }
    if (!helperId) return
    setBusy(true)
    try {
      const result = await repository.commit(need.id, selected.label, amount, helperId)
      setMessage(
        `Gracias. Quedaste comprometido con ${result.effective} ${selected.unit} de «${selected.label}». ${result.notice ?? ''}`.trim(),
      )
      setQuantity('1')
      onCommitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos registrar tu compromiso. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      className="rounded-card border border-t-4 border-line border-t-primary bg-white p-5 shadow-soft md:p-6"
      aria-labelledby="como-ayudar"
    >
      <h2 id="como-ayudar" className="flex items-center gap-2 font-display text-headline-sm text-ink">
        <Icon name="volunteer_activism" className="text-[22px] text-primary" /> ¿Cómo quieres ayudar?
      </h2>
      <p className="mt-1 text-sm text-ink-soft">Elige un ítem y la cantidad con la que te comprometes.</p>

      {!open && (
        <p className="mt-3 rounded-xl bg-surface-mid p-3 text-sm font-semibold text-ink">
          Esta necesidad ya está cubierta. Gracias por querer ayudar.
        </p>
      )}

      {!helperId ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-ink-soft">Ingresa para comprometerte. Después te traemos de vuelta aquí.</p>
          <ButtonLink to={signInHref(`${pathname}${search}`)} className="min-h-11 w-full">
            <Icon name="login" className="text-[18px]" /> Ingresa para comprometerte
          </ButtonLink>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-4 space-y-4">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">1. Elige el ítem</legend>
            <div className="mt-2 space-y-2">
              {need.items.map((item, i) => {
                const missing = remaining(item)
                return (
                  <label
                    key={item.label}
                    className={`flex min-h-11 items-center gap-3 rounded-xl border border-line p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary has-[:checked]:ring-1 has-[:checked]:ring-primary ${missing === 0 ? 'bg-surface-mid text-ink-soft' : 'cursor-pointer bg-white text-ink'}`}
                  >
                    <input
                      type="radio"
                      id={`commit-item-${i}`}
                      name="commit-item"
                      value={item.label}
                      disabled={missing === 0}
                      checked={selected?.label === item.label}
                      onChange={() => setLabel(item.label)}
                      className="h-4 w-4 border-line text-primary focus:ring-primary"
                    />
                    <span className="min-w-0 flex-1 font-medium">{item.label}</span>
                    <span className="shrink-0 rounded-full bg-surface-high px-2 py-0.5 text-xs font-semibold text-ink-soft">
                      {missing === 0 ? 'Cubierto' : `Faltan ${missing}`}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="commit-quantity" className="block text-sm font-semibold text-ink">
              2. Cantidad con la que te comprometes{selected ? ` (${selected.unit})` : ''}
            </label>
            <input
              id="commit-quantity"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'commit-error' : undefined}
              className={`mt-1.5 ${fieldClass}`}
            />
            <FieldError id="commit-error">{error ?? undefined}</FieldError>
          </div>

          <Button type="submit" className="min-h-11 w-full" disabled={busy}>
            <Icon name="handshake" className="text-[18px]" />
            {busy ? 'Registrando…' : 'Me comprometo'}
          </Button>

          {message && (
            <p role="status" className="rounded-xl bg-need-done-soft p-3 text-sm font-semibold text-ink">
              {message}
            </p>
          )}
          {covered && (
            <p role="status" className="rounded-xl bg-surface-mid p-3 text-sm font-semibold text-ink">
              Esta necesidad ya está cubierta al 100 %. Mira abajo los puntos sin ayuda más cercanos, donde tu apoyo sí
              hace falta.{' '}
              <a href="#puntos-cercanos" className="underline">
                Ir a los puntos cercanos
              </a>
            </p>
          )}
          <p className="flex items-start gap-2 text-sm text-ink-soft">
            <Icon name="lock" className="mt-0.5 text-[16px]" />
            El contacto directo y el punto de entrega se comparten de forma segura, solo con quien recibe la ayuda.
          </p>
        </form>
      )}
    </section>
  )
}

import { FieldError, fieldClass } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'

interface Props {
  value: number
  error?: string
  onChange: (value: number) => void
}

const stepClass =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink hover:bg-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'

/** Número de personas afectadas, con botones para sumar y restar (áreas táctiles de 44 px). */
export function PeopleField({ value, error, onChange }: Props) {
  const safe = Number.isFinite(value) ? value : 0
  return (
    <div>
      <label htmlFor="need-people" className="block text-sm font-semibold text-ink">
        Número de personas afectadas
      </label>
      <p className="mt-0.5 text-sm text-ink-soft">Cuenta a todas las personas de tu grupo o de tu negocio.</p>
      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="button"
          className={stepClass}
          aria-label="Una persona menos"
          onClick={() => onChange(Math.max(1, safe - 1))}
        >
          <Icon name="remove" className="text-[18px]" />
        </button>
        <input
          id="need-people"
          type="number"
          inputMode="numeric"
          min={1}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'need-people-error' : undefined}
          className={`${fieldClass} text-center`}
        />
        <button type="button" className={stepClass} aria-label="Una persona más" onClick={() => onChange(safe + 1)}>
          <Icon name="add" className="text-[18px]" />
        </button>
      </div>
      <FieldError id="need-people-error">{error}</FieldError>
    </div>
  )
}

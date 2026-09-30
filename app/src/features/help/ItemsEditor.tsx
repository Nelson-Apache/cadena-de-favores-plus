import { Button } from '@/components/ui/Button'
import { FieldError, TextField } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import type { ItemDraft } from './useRequestHelpForm'

interface Props {
  items: ItemDraft[]
  error?: string
  onChange: (index: number, patch: Partial<ItemDraft>) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

/** Lista de ítems que se necesitan, cada uno con su cantidad y unidad. */
export function ItemsEditor({ items, error, onChange, onAdd, onRemove }: Props) {
  return (
    <fieldset
      id="need-items"
      data-invalid={error ? '' : undefined}
      aria-describedby={error ? 'need-items-error' : undefined}
    >
      <legend className="text-sm font-semibold text-ink">¿Qué necesitas y cuánto?</legend>
      <p className="mt-0.5 text-sm text-ink-soft">
        Agrega cada cosa por separado. Así quien ayuda puede elegir con qué apoyar.
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-xl border border-line bg-surface-low p-3.5">
            <div className="grid gap-3 sm:grid-cols-[1fr_110px_150px]">
              <TextField
                id={`need-item-${i}-label`}
                label="Ítem"
                placeholder="Ej.: Carpas familiares"
                value={item.label}
                onChange={(e) => onChange(i, { label: e.target.value })}
                aria-invalid={error && !item.label.trim() ? true : undefined}
              />
              <TextField
                id={`need-item-${i}-quantity`}
                label="Cantidad"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="5"
                value={item.quantity}
                onChange={(e) => onChange(i, { quantity: e.target.value })}
                aria-invalid={error && !(Number(item.quantity) > 0) ? true : undefined}
              />
              <TextField
                id={`need-item-${i}-unit`}
                label="Unidad"
                placeholder="carpas, litros…"
                value={item.unit}
                onChange={(e) => onChange(i, { unit: e.target.value })}
              />
            </div>
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                className="mt-2 min-h-10"
                onClick={() => onRemove(i)}
                aria-label={`Quitar el ítem ${i + 1}`}
              >
                <Icon name="delete" className="text-[18px]" /> Quitar
              </Button>
            )}
          </li>
        ))}
      </ul>
      <FieldError id="need-items-error">{error}</FieldError>
      <Button type="button" variant="secondary" className="mt-3 min-h-10" onClick={onAdd}>
        <Icon name="add" className="text-[18px]" /> Agregar otro ítem
      </Button>
    </fieldset>
  )
}

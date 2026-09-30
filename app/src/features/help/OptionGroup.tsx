import type { ReactNode } from 'react'
import { FieldError } from '@/components/ui/Field'

interface Props {
  id: string
  legend: string
  hint?: string
  error?: string
  children: ReactNode
}

/** `fieldset` con leyenda y error junto al grupo. Marca `data-invalid` para llevar el foco al primer error. */
export function OptionGroup({ id, legend, hint, error, children }: Props) {
  return (
    <fieldset id={id} data-invalid={error ? '' : undefined} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      {hint && <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-2">{children}</div>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </fieldset>
  )
}

import { useId, type ComponentProps } from 'react'
import { Icon } from './Icon'

/** Clases comunes de un campo de formulario (guía de estilo › Campo de formulario). */
export const fieldClass =
  'block w-full rounded-xl border-line bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:ring-primary aria-[invalid=true]:border-ink aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-ink'

/**
 * Mensaje de error junto al campo. El rojo está reservado al estado de una necesidad,
 * por eso el error se distingue con ícono, peso y texto.
 */
export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-ink">
      <Icon name="emergency_home" className="mt-0.5 text-[16px]" />
      {children}
    </p>
  )
}

interface TextFieldProps extends ComponentProps<'input'> {
  label: string
  hint?: string
  error?: string
}

/** Campo de texto con `label`, ayuda y error asociados por `aria-describedby`. Reenvía `ref` y props nativas. */
export function TextField({ label, hint, error, id, className = '', ...props }: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-ayuda`
  const errorId = `${inputId}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-0.5 text-sm text-ink-soft">
          {hint}
        </p>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1.5 ${fieldClass}`}
        {...props}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}

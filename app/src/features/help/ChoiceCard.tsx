import type { ComponentProps, ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'

interface Props extends Omit<ComponentProps<'input'>, 'type' | 'children' | 'title'> {
  icon: string
  title: string
  hint: string
  /** Contenido extra al pie (p. ej. una etiqueta). */
  children?: ReactNode
}

/** Tarjeta que funciona como opción de un grupo de radios. El `input` real queda oculto pero enfocable. */
export function ChoiceCard({ icon, title, hint, className = '', children, ...props }: Props) {
  return (
    <label
      className={`relative flex min-h-[64px] cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3.5 transition hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary has-[:checked]:ring-1 has-[:checked]:ring-primary ${className}`}
    >
      <input type="radio" className="peer sr-only" {...props} />
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-mid text-primary peer-checked:bg-primary peer-checked:text-white">
        <Icon name={icon} className="text-[20px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-soft">{hint}</span>
        {children}
      </span>
      <Icon
        name="check"
        className="text-[18px] text-primary opacity-0 transition peer-checked:opacity-100"
        filled={false}
      />
    </label>
  )
}

import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'

interface Props {
  icon: string
  eyebrow: string
  title: string
  children: ReactNode
  actions: ReactNode
}

/** Tarjeta centrada que reemplaza una pantalla cuando falta ingresar o no se tiene el rol necesario. */
export function GateCard({ icon, eyebrow, title, children, actions }: Props) {
  return (
    <section className="mx-auto max-w-content px-4 py-16 md:py-20 lg:px-6">
      <div className="mx-auto max-w-xl rounded-card border border-line bg-white p-5 shadow-soft md:p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name={icon} />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">{eyebrow}</p>
        <h1 className="mt-1 font-display text-[28px] font-bold leading-tight text-ink md:text-headline-lg">{title}</h1>
        <div className="mt-3 space-y-2 text-ink-soft">{children}</div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
      </div>
    </section>
  )
}

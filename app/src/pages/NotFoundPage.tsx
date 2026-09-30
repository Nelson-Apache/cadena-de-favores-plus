import { ButtonLink } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-content px-4 py-24 text-center">
      <p className="font-display text-display-lg text-primary">404</p>
      <h1 className="mt-2 font-display text-headline-md text-ink">No encontramos esta página</h1>
      <div className="mt-8">
        <ButtonLink to="/">Volver al inicio</ButtonLink>
      </div>
    </section>
  )
}

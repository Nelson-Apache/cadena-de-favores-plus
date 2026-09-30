import { ResetDemoDataButton } from './ResetDemoDataButton'

/** Herramientas de la demostración para el coordinador (antes de cada prueba con usuarios). */
export function DemoDataCard() {
  return (
    <section className="mx-auto max-w-content px-4 pb-16 lg:px-6" aria-labelledby="datos-demo">
      <div className="mx-auto max-w-2xl rounded-card border border-line bg-white p-5 shadow-soft md:p-6">
        <h2 id="datos-demo" className="font-display text-headline-sm text-ink">
          Datos de demostración
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Antes de cada prueba con usuarios, vuelve al estado inicial: se borra lo registrado en este navegador y se
          cargan de nuevo los datos del Quindío.
        </p>
        <ResetDemoDataButton className="mt-4 w-full sm:w-auto" />
      </div>
    </section>
  )
}

import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { ROLE_LABEL } from '@/lib/labels'
import { CreateProfileForm } from './CreateProfileForm'
import { DemoProfilePicker } from './DemoProfilePicker'
import { returnPathFrom } from './returnPath'
import { useSession } from './useSession'

/**
 * "Ingresar" (inicio de sesión simulado, sin contraseñas). Spec: cuentas-y-privacidad › Inicio de sesión simulado.
 * Tras ingresar vuelve a la ruta de `?volver=` (p. ej. "Pedir ayuda") o al inicio.
 */
export function SignInPage() {
  const current = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = returnPathFrom(params)
  const goBack = () => navigate(returnTo ?? '/', { replace: true })

  return (
    <section className="mx-auto max-w-content px-4 py-12 md:py-16 lg:px-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">
          Ingreso simulado · demostración
        </p>
        <h1 className="mt-1 font-display text-[28px] font-bold leading-tight text-ink md:text-headline-lg">
          Ingresa a Cadena de Favores+
        </h1>
        <p className="mt-3 text-ink-soft">
          No necesitas contraseña. Elige un perfil de demostración o crea el tuyo con tu nombre y tu cédula o NIT.
        </p>
      </header>

      {(returnTo || current) && (
        <div className="mt-6 max-w-2xl space-y-2" role="status">
          {returnTo && (
            <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-low p-3 text-sm text-ink">
              <Icon name="info" className="mt-0.5 text-[18px] text-primary" />
              Para continuar necesitas ingresar. Después te llevamos de vuelta a donde estabas.
            </p>
          )}
          {current && (
            <p className="flex items-start gap-2 rounded-xl border border-line bg-surface-low p-3 text-sm text-ink">
              <Icon name="person" className="mt-0.5 text-[18px] text-primary" />
              <span>
                Ya ingresaste como <strong className="font-semibold">{current.profile.name}</strong> (
                {ROLE_LABEL[current.profile.role]}). Si eliges otro perfil, cambiarás de sesión.
              </span>
            </p>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
        <section
          aria-labelledby="perfiles-demo"
          className="rounded-card border border-line bg-white p-5 shadow-soft md:p-6"
        >
          <h2 id="perfiles-demo" className="font-display text-headline-sm text-ink">
            Elige un perfil de demostración
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Ideal para las pruebas con usuarios: ingresas con un toque.</p>
          <div className="mt-5">
            <DemoProfilePicker currentId={current?.profile.id} onSignedIn={goBack} />
          </div>
        </section>

        <section
          aria-labelledby="crear-perfil"
          className="rounded-card border border-line bg-white p-5 shadow-soft md:p-6"
        >
          <h2 id="crear-perfil" className="font-display text-headline-sm text-ink">
            O crea tu perfil
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Tu perfil tendrá rol Usuario. El documento se registra y se marca como verificado (simulado).
          </p>
          <div className="mt-5">
            <CreateProfileForm onSignedIn={goBack} />
          </div>
        </section>
      </div>
    </section>
  )
}

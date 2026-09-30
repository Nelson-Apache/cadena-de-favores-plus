import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { Role } from '@/domain/types'
import { ROLE_LABEL } from '@/lib/labels'
import { GateCard } from './GateCard'
import { signInHref } from './returnPath'
import { useSession } from './useSession'

interface Props {
  /** Qué intenta hacer la persona, en infinitivo: "pedir ayuda", "ofrecer una vivienda". */
  action: string
  /** Rol necesario (p. ej. `coordinador`); sin él se muestra "Acceso restringido". */
  role?: Role
  children: ReactNode
}

/**
 * Guardián de rutas: pide ingresar antes de publicar y restringe por rol.
 * Spec: cuentas-y-privacidad › Publicar sin sesión · Usuario sin rol coordinador.
 * Tras ingresar, "Ingresar" devuelve a la ruta original.
 */
export function RequireSession({ action, role, children }: Props) {
  const current = useSession()
  const { pathname, search } = useLocation()
  const signIn = signInHref(`${pathname}${search}`)

  if (!current) {
    return (
      <GateCard
        icon="lock"
        eyebrow="Primero ingresa"
        title="Ingresa para continuar"
        actions={
          <>
            <ButtonLink to={signIn} className="w-full sm:w-auto">
              <Icon name="login" className="text-[18px]" /> Ingresar
            </ButtonLink>
            <ButtonLink to="/mapa" variant="secondary" className="w-full sm:w-auto">
              Ver el mapa sin ingresar
            </ButtonLink>
          </>
        }
      >
        <p>Para {action} necesitamos saber quién eres. Así lo que registres queda asociado a tu perfil.</p>
        <p className="text-sm">
          Solo toma un momento: elige un perfil de demostración o crea el tuyo con tu nombre y cédula o NIT. Después te
          traemos de vuelta aquí.
        </p>
      </GateCard>
    )
  }

  if (role && current.profile.role !== role) {
    return (
      <GateCard
        icon="lock"
        eyebrow={`Solo para el rol ${ROLE_LABEL[role]}`}
        title="Acceso restringido"
        actions={
          <>
            <ButtonLink to="/" className="w-full sm:w-auto">
              Volver al inicio
            </ButtonLink>
            <ButtonLink to={signIn} variant="secondary" className="w-full sm:w-auto">
              Ingresar con otro perfil
            </ButtonLink>
          </>
        }
      >
        <p>
          Esta sección es solo para perfiles con rol {ROLE_LABEL[role]}. Ingresaste como{' '}
          <strong className="font-semibold text-ink">{current.profile.name}</strong> con rol{' '}
          {ROLE_LABEL[current.profile.role]}.
        </p>
      </GateCard>
    )
  }

  return <>{children}</>
}

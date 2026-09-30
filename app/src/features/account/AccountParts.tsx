import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import type { DocType, Role } from '@/domain/types'
import { initialsOf, maskDocNumber } from '@/lib/format'
import { DOC_TYPE_LABEL, ROLE_LABEL } from '@/lib/labels'

const AVATAR_SIZE = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm' } as const

/** Círculo con las iniciales del perfil (decorativo: el nombre siempre va en texto al lado o en `aria-label`). */
export function ProfileAvatar({ name, size = 'md' }: { name: string; size?: keyof typeof AVATAR_SIZE }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-display font-semibold text-white ${AVATAR_SIZE[size]}`}
    >
      {initialsOf(name)}
    </span>
  )
}

const ROLE_STYLE: Record<Role, string> = {
  usuario: 'bg-surface-mid text-ink-soft',
  coordinador: 'bg-primary/10 text-primary-dark',
}

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLE[role]}`}>
      {ROLE_LABEL[role]}
    </span>
  )
}

interface SummaryProps {
  name: string
  /** Tipo de perfil de demostración, p. ej. "Comerciante afectado" (si aplica). */
  kind?: string
  role: Role
  docType: DocType
  docNumber: string
  verified: boolean
}

/** Resumen de la cuenta propia. Solo se muestra a su dueño: el documento va enmascarado. */
export function AccountSummary({ name, kind, role, docType, docNumber, verified }: SummaryProps) {
  return (
    <div className="flex items-start gap-3">
      <ProfileAvatar name={name} />
      <div className="min-w-0">
        <p className="truncate font-display text-base font-semibold text-ink">{name}</p>
        {kind && kind !== ROLE_LABEL[role] && <p className="text-xs text-ink-soft">{kind}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <RoleBadge role={role} />
          <span className="text-xs text-ink-muted">
            {DOC_TYPE_LABEL[docType]} {maskDocNumber(docNumber)}
          </span>
        </div>
        {verified && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-ink-soft">
            <Icon name="verified_user" className="text-[14px] text-primary" /> Documento verificado (simulado)
          </p>
        )}
      </div>
    </div>
  )
}

const ITEM =
  'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-surface-mid'

function ActionLink({
  to,
  icon,
  onClick,
  children,
}: {
  to: string
  icon: string
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <Link to={to} onClick={onClick} className={ITEM}>
      <Icon name={icon} className="text-[20px] text-primary" /> {children}
    </Link>
  )
}

function ActionButton({ icon, onClick, children }: { icon: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={ITEM}>
      <Icon name={icon} className="text-[20px] text-primary" /> {children}
    </button>
  )
}

interface ActionsProps {
  isCoordinator: boolean
  /** Se llama al elegir cualquier opción (para cerrar el menú que la contiene). */
  onDone: () => void
  onRequestReset: () => void
  onSignOut: () => void
}

/** Opciones de la cuenta: iguales en el menú de escritorio y en el de celular. */
export function AccountActions({ isCoordinator, onDone, onRequestReset, onSignOut }: ActionsProps) {
  return (
    <ul className="space-y-0.5">
      {isCoordinator && (
        <>
          <li>
            <ActionLink to="/coordinacion" icon="monitoring" onClick={onDone}>
              Panel de coordinación
            </ActionLink>
          </li>
          <li>
            <ActionButton
              icon="restart_alt"
              onClick={() => {
                onDone()
                onRequestReset()
              }}
            >
              Restablecer datos de demostración
            </ActionButton>
          </li>
        </>
      )}
      <li>
        <ActionLink to="/ingresar" icon="person" onClick={onDone}>
          Cambiar de perfil
        </ActionLink>
      </li>
      <li>
        <ActionButton
          icon="logout"
          onClick={() => {
            onDone()
            onSignOut()
          }}
        >
          Cerrar sesión
        </ActionButton>
      </li>
    </ul>
  )
}

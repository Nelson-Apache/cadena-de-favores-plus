import { useEffect, useId, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { Profile } from '@/domain/types'
import { ROLE_LABEL } from '@/lib/labels'
import { AccountActions, AccountSummary, ProfileAvatar } from './AccountParts'
import { demoLabelOf } from './demoProfiles'

interface Props {
  profile: Profile
  isCoordinator: boolean
  onRequestReset: () => void
  onSignOut: () => void
}

/** Menú de usuario de escritorio: nombre y rol en la barra, opciones de la cuenta en un panel desplegable. */
export function UserMenu({ profile, isCoordinator, onRequestReset, onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const role = ROLE_LABEL[profile.role]

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Tu cuenta: ${profile.name}, ${role}`}
        title={`${profile.name} · ${role}`}
        className="flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-1 pr-2.5 transition hover:bg-surface-low xl:gap-2"
      >
        <ProfileAvatar name={profile.name} size="sm" />
        <span className="text-xs font-semibold text-ink-soft xl:hidden">
          {role === 'Coordinador' ? 'Coord.' : role}
        </span>
        <span className="hidden max-w-[7rem] text-left leading-tight xl:block">
          <span className="block truncate text-sm font-semibold text-ink">{profile.name}</span>
          <span className="block text-xs text-ink-soft">{role}</span>
        </span>
        <Icon name="expand_more" className={`text-[16px] text-ink-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-10 mt-2 w-80 rounded-card border border-line bg-white p-3 shadow-lift"
        >
          <div className="border-b border-line px-2 pb-3 pt-1">
            <AccountSummary
              name={profile.name}
              kind={demoLabelOf(profile.id)}
              role={profile.role}
              docType={profile.docType}
              docNumber={profile.docNumber}
              verified={profile.verified}
            />
          </div>
          <div className="pt-2">
            <AccountActions
              isCoordinator={isCoordinator}
              onDone={() => setOpen(false)}
              onRequestReset={onRequestReset}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      )}
    </div>
  )
}

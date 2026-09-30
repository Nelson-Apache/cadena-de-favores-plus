import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { session } from '@/data'
import { canCoordinate } from '@/domain/profile'
import { AccountActions, AccountSummary, ProfileAvatar } from '@/features/account/AccountParts'
import { demoLabelOf } from '@/features/account/demoProfiles'
import { ResetDemoDataDialog } from '@/features/account/ResetDemoDataDialog'
import { signInHref } from '@/features/account/returnPath'
import { UserMenu } from '@/features/account/UserMenu'
import { useSession } from '@/features/account/useSession'
import { ButtonLink } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'

const LINKS = [
  { to: '/mapa', label: 'Mapa', icon: 'map' },
  { to: '/red-lista/registrar', label: 'Red lista', icon: 'shield' },
  { to: '/vivienda/ofrecer', label: 'Vivienda solidaria', icon: 'home' },
  { to: '/coordinacion', label: 'Coordinación', icon: 'monitoring' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const current = useSession()
  const { pathname, search } = useLocation()
  const profile = current?.profile
  const isCoordinator = canCoordinate(profile)
  const signIn = signInHref(`${pathname}${search}`)
  const closeMenu = () => setOpen(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-2 text-sm xl:px-2.5 font-medium transition ${isActive ? 'bg-primary/10 text-primary-dark' : 'text-ink-soft hover:text-primary-dark hover:bg-surface-mid'}`

  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 lg:gap-3 lg:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink to="/pedir-ayuda" variant="secondary" className="lg:px-4">
            <Icon name="sos" className="hidden text-[18px] text-need-none xl:inline-block" /> Pedir ayuda
          </ButtonLink>
          <ButtonLink to="/mapa?vista=mas-falta" className="lg:px-4">
            <Icon name="volunteer_activism" className="hidden text-[18px] xl:inline-block" /> Ofrecer ayuda
          </ButtonLink>
          {profile ? (
            <UserMenu
              profile={profile}
              isCoordinator={isCoordinator}
              onRequestReset={() => setResetOpen(true)}
              onSignOut={session.signOut}
            />
          ) : (
            <ButtonLink to={signIn} variant="ghost" className="px-3">
              <Icon name="login" className="hidden text-[18px] xl:inline-block" /> Ingresar
            </ButtonLink>
          )}
        </div>
        <button
          className="flex min-h-10 items-center gap-2 rounded-full p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={profile ? `Abrir menú (sesión de ${profile.name})` : 'Abrir menú'}
        >
          {profile && <ProfileAvatar name={profile.name} size="sm" />}
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
      {open && (
        <nav className="border-t border-line bg-surface px-4 pb-4 pt-2 lg:hidden" aria-label="Principal móvil">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-ink hover:bg-surface-mid"
            >
              <Icon name={l.icon} className="text-primary" /> {l.label}
            </NavLink>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ButtonLink to="/pedir-ayuda" variant="secondary" onClick={closeMenu}>
              Pedir ayuda
            </ButtonLink>
            <ButtonLink to="/mapa?vista=mas-falta" onClick={closeMenu}>
              Ofrecer ayuda
            </ButtonLink>
          </div>
          <div className="mt-4 border-t border-line pt-4">
            {profile ? (
              <section aria-label="Tu cuenta" className="rounded-card border border-line bg-white p-3">
                <div className="px-2 pb-3 pt-1">
                  <AccountSummary
                    name={profile.name}
                    kind={demoLabelOf(profile.id)}
                    role={profile.role}
                    docType={profile.docType}
                    docNumber={profile.docNumber}
                    verified={profile.verified}
                  />
                </div>
                <div className="border-t border-line pt-2">
                  <AccountActions
                    isCoordinator={isCoordinator}
                    onDone={closeMenu}
                    onRequestReset={() => setResetOpen(true)}
                    onSignOut={session.signOut}
                  />
                </div>
              </section>
            ) : (
              <ButtonLink to={signIn} variant="secondary" onClick={closeMenu} className="w-full">
                <Icon name="login" className="text-[18px]" /> Ingresar
              </ButtonLink>
            )}
          </div>
        </nav>
      )}
      <ResetDemoDataDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </header>
  )
}

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { session } from '@/data'
import { ROLE_LABEL } from '@/lib/labels'
import { demoIconOf } from './demoProfiles'

interface Props {
  /** Perfil con la sesión actual (se marca como "Sesión actual"). */
  currentId?: string
  onSignedIn: () => void
}

/** Los 4 perfiles de demostración: tocar uno ingresa de inmediato con ese perfil. */
export function DemoProfilePicker({ currentId, onSignedIn }: Props) {
  const [error, setError] = useState<string | null>(null)
  const profiles = session.listDemoProfiles()

  const choose = (id: string) => {
    try {
      session.signIn(id)
      onSignedIn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos ingresar con ese perfil. Intenta de nuevo.')
    }
  }

  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {profiles.map((p) => {
          const isCurrent = p.id === currentId
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => choose(p.id)}
                className={`flex h-full w-full items-start gap-3 rounded-xl border p-4 text-left transition hover:border-primary/40 hover:bg-surface-low hover:shadow-soft ${isCurrent ? 'border-primary bg-primary/5' : 'border-line bg-white'}`}
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={demoIconOf(p.id)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-display text-base font-semibold text-ink">{p.label}</span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                        <Icon name="check" className="text-[12px]" /> Sesión actual
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{p.description}</span>
                  <span className="mt-1.5 block text-xs font-medium text-ink-muted">
                    {p.name} · {ROLE_LABEL[p.role]}
                  </span>
                </span>
                <Icon name="arrow_forward" className="mt-3 text-[18px] text-primary" />
              </button>
            </li>
          )
        })}
      </ul>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-surface-mid p-3 text-sm font-semibold text-ink">
          {error}
        </p>
      )}
    </div>
  )
}

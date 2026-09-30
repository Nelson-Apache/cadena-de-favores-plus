import { useState } from 'react'
import { isPersistent } from '@/data'
import { Icon } from '../ui/Icon'

/** Texto exacto de la spec (cuentas-y-privacidad › Navegador sin almacenamiento). */
export const STORAGE_NOTICE = 'Los datos no se guardarán al cerrar el navegador'

/** Aviso visible cuando el navegador no permite guardar y la plataforma funciona solo en memoria. */
export function StorageNotice() {
  const [hidden, setHidden] = useState(false)
  if (isPersistent || hidden) return null
  return (
    <div role="status" className="border-b border-sand-dark bg-sand">
      <div className="mx-auto flex max-w-content items-start gap-3 px-4 py-2.5 lg:px-6">
        <Icon name="cloud_off" className="mt-0.5 text-[20px] text-ink" />
        <p className="flex-1 text-sm text-ink">
          <strong className="font-semibold">{STORAGE_NOTICE}.</strong>{' '}
          <span className="hidden text-ink-soft sm:inline">
            Este navegador no permite guardar información (por ejemplo, en modo privado). Puedes usar la plataforma,
            pero lo que registres se perderá al recargar o cerrar la página.
          </span>
        </p>
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Ocultar aviso"
          className="-my-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-sand-dark/40"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>
    </div>
  )
}

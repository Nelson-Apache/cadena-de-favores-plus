import { useEffect, useId, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Botones de acción al pie del diálogo. */
  actions?: ReactNode
}

/**
 * Diálogo modal accesible sobre `<dialog>` nativo: atrapa el foco, se cierra con Esc o tocando el fondo.
 * Reemplaza a `window.confirm()` para confirmar acciones dentro de la pantalla.
 */
export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card border border-line bg-white p-0 text-ink shadow-lift backdrop:bg-ink/50"
    >
      <div className="p-5 md:p-6">
        <h2 id={titleId} className="font-display text-headline-sm text-ink">
          {title}
        </h2>
        <div className="mt-3 text-sm leading-relaxed text-ink-soft">{children}</div>
        {actions && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{actions}</div>}
      </div>
    </dialog>
  )
}

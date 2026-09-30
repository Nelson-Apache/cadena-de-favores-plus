import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { resetDemoData } from '@/data'

interface Props {
  open: boolean
  onClose: () => void
}

type Phase = 'confirm' | 'done'

/**
 * Confirmación en pantalla para "Restablecer datos de demostración" (solo coordinador; sin `window.confirm()`).
 * Spec: cuentas-y-privacidad › Restablecer datos de demostración.
 */
export function ResetDemoDataDialog({ open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('confirm')
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    onClose()
    setPhase('confirm')
    setError(null)
  }

  const confirm = () => {
    try {
      resetDemoData()
      setError(null)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos restablecer los datos. Intenta de nuevo.')
    }
  }

  if (phase === 'done') {
    return (
      <Dialog
        open={open}
        onClose={close}
        title="Datos de demostración restablecidos"
        actions={
          <Button onClick={close} autoFocus>
            Entendido
          </Button>
        }
      >
        <p role="status">
          Listo: se cargaron de nuevo los datos iniciales del Quindío. Ya puedes empezar la prueba con usuarios.
        </p>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="¿Restablecer los datos de demostración?"
      actions={
        <>
          <Button variant="secondary" onClick={close} autoFocus>
            Cancelar
          </Button>
          <Button onClick={confirm}>Sí, restablecer</Button>
        </>
      }
    >
      <p>
        Se borrarán las necesidades, recursos, viviendas, solicitudes y perfiles creados en este navegador, y se
        cargarán de nuevo los datos iniciales de demostración. Tu sesión de coordinador se mantiene.
      </p>
      <p className="mt-2 font-semibold text-ink">Esta acción no se puede deshacer.</p>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-surface-mid p-3 font-medium text-ink">
          {error}
        </p>
      )}
    </Dialog>
  )
}

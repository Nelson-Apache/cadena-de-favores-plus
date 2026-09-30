import { useState, type ComponentProps } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ResetDemoDataDialog } from './ResetDemoDataDialog'

/** Botón "Restablecer datos de demostración" con su confirmación en pantalla. */
export function ResetDemoDataButton(props: Omit<ComponentProps<typeof Button>, 'onClick' | 'children'>) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" {...props} onClick={() => setOpen(true)}>
        <Icon name="restart_alt" className="text-[18px]" /> Restablecer datos de demostración
      </Button>
      <ResetDemoDataDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

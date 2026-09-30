import { FieldError } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'

interface Props {
  /** `id` de la casilla, para llevar el foco a ella si falta la autorización. */
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

/**
 * Aviso de tratamiento de datos personales (Ley 1581 de 2012) con la casilla de autorización obligatoria.
 * Spec: cuentas-y-privacidad › Tratamiento de datos.
 */
export function DataTreatmentNotice({ id, checked, onChange, error }: Props) {
  return (
    <div role="group" aria-labelledby="aviso-datos-titulo" className="rounded-xl border border-line bg-surface-low p-4">
      <h3 id="aviso-datos-titulo" className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon name="lock" className="text-[18px] text-primary" /> Tratamiento de tus datos personales
      </h3>
      <div id="aviso-datos" className="mt-2 space-y-2 text-sm leading-relaxed text-ink-soft">
        <p>
          Usamos tu nombre y tu número de cédula o NIT solo para identificarte en la plataforma y asociar a tu perfil lo
          que registres (necesidades, recursos o viviendas) para coordinar la ayuda.
        </p>
        <p>
          Tu documento, tu dirección exacta y tu teléfono no se publican. En las vistas públicas solo se muestran el
          municipio, el barrio y una ubicación aproximada.
        </p>
        <p>
          Como titular, la Ley 1581 de 2012 te da derecho a conocer, actualizar y rectificar tus datos. Esta es una
          demostración académica: los datos se guardan solo en este navegador.
        </p>
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-white p-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={['aviso-datos', error && 'aviso-datos-error'].filter(Boolean).join(' ')}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-line text-primary focus:ring-primary"
        />
        <span className="text-sm font-medium text-ink">
          Autorizo el tratamiento de mis datos personales para las finalidades descritas, según la Ley 1581 de 2012.{' '}
          <span className="text-ink-soft">(Obligatorio)</span>
        </span>
      </label>
      <FieldError id="aviso-datos-error">{error}</FieldError>
    </div>
  )
}

import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { FieldError, TextField } from '@/components/ui/Field'
import { Icon } from '@/components/ui/Icon'
import { DOC_TYPES } from '@/domain/profile'
import { DOC_TYPE_LABEL } from '@/lib/labels'
import { DataTreatmentNotice } from './DataTreatmentNotice'
import { useCreateProfileForm, type ProfileField } from './useCreateProfileForm'

/** `id` de cada control, para llevar el foco al primer campo con error. */
const FIELD_ID: Record<ProfileField, string> = {
  name: 'perfil-nombre',
  docType: 'perfil-tipo-CC',
  docNumber: 'perfil-documento',
  acceptsDataTreatment: 'perfil-autorizacion',
}

/** "Crea tu perfil": nombre, cédula o NIT y autorización de datos. Al crearlo, ingresa con él. */
export function CreateProfileForm({ onSignedIn }: { onSignedIn: () => void }) {
  const { values, errors, formError, setField, submit } = useCreateProfileForm(onSignedIn)
  const isNit = values.docType === 'NIT'

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const firstInvalid = submit()
    if (firstInvalid) document.getElementById(FIELD_ID[firstInvalid])?.focus()
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <TextField
        id={FIELD_ID.name}
        label="Nombre completo o razón social"
        autoComplete="name"
        value={values.name}
        onChange={(e) => setField('name', e.target.value)}
        error={errors.name}
        placeholder="Ej.: Martha Giraldo o Panadería La Espiga"
      />

      <fieldset aria-describedby={errors.docType ? 'perfil-tipo-error' : undefined}>
        <legend className="text-sm font-semibold text-ink">Tipo de documento</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {DOC_TYPES.map((type) => (
            <label
              key={type}
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${values.docType === type ? 'border-primary bg-primary/5 text-primary-dark' : 'border-line bg-white text-ink hover:bg-surface-low'}`}
            >
              <input
                id={`perfil-tipo-${type}`}
                type="radio"
                name="docType"
                value={type}
                checked={values.docType === type}
                onChange={() => setField('docType', type)}
                className="h-4 w-4 border-line text-primary focus:ring-primary"
              />
              {DOC_TYPE_LABEL[type]}
            </label>
          ))}
        </div>
        <FieldError id="perfil-tipo-error">{errors.docType}</FieldError>
      </fieldset>

      <TextField
        id={FIELD_ID.docNumber}
        label={isNit ? 'Número de NIT' : 'Número de cédula'}
        hint="Solo números; puede llevar puntos o guion. Quedará como verificado (simulado) y no se publica."
        inputMode="numeric"
        autoComplete="off"
        value={values.docNumber}
        onChange={(e) => setField('docNumber', e.target.value)}
        error={errors.docNumber}
        placeholder={isNit ? 'Ej.: 900.123.456-7' : 'Ej.: 1094123456'}
      />

      <DataTreatmentNotice
        id={FIELD_ID.acceptsDataTreatment}
        checked={values.acceptsDataTreatment}
        onChange={(checked) => setField('acceptsDataTreatment', checked)}
        error={errors.acceptsDataTreatment}
      />

      {formError && (
        <p role="alert" className="rounded-xl bg-surface-mid p-3 text-sm font-semibold text-ink">
          {formError}
        </p>
      )}

      <Button type="submit" className="w-full sm:w-auto">
        <Icon name="person_add" className="text-[18px]" /> Crear perfil e ingresar
      </Button>
    </form>
  )
}

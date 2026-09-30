import { useState } from 'react'
import { session } from '@/data'
import { validateNewProfile, type ProfileErrors } from '@/domain/profile'
import type { NewProfileInput } from '@/domain/types'

const EMPTY: NewProfileInput = { name: '', docType: 'CC', docNumber: '', acceptsDataTreatment: false }

export type ProfileField = keyof NewProfileInput

/**
 * Estado del formulario "Crea tu perfil". Valida con la regla del dominio (`validateNewProfile`):
 * los errores aparecen después del primer intento y se actualizan mientras la persona corrige.
 */
export function useCreateProfileForm(onSignedIn: () => void) {
  const [values, setValues] = useState<NewProfileInput>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const errors: ProfileErrors = submitted ? validateNewProfile(values).errors : {}

  const setField = <K extends ProfileField>(field: K, value: NewProfileInput[K]) =>
    setValues((prev) => ({ ...prev, [field]: value }))

  /** Crea el perfil e ingresa con él. Devuelve el primer campo con error (para llevar el foco) o `null`. */
  const submit = (): ProfileField | null => {
    setSubmitted(true)
    setFormError(null)
    try {
      const result = session.createProfile(values)
      if (!result.ok) return (Object.keys(result.errors)[0] as ProfileField | undefined) ?? null
      session.signIn(result.profile.id)
      onSignedIn()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'No pudimos crear el perfil. Intenta de nuevo.')
    }
    return null
  }

  return { values, errors, formError, setField, submit }
}

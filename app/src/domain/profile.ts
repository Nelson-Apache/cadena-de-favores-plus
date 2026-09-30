import type { DocType, NewProfileInput, Profile, Role } from './types'

/**
 * Reglas de perfiles y roles (spec: cuentas-y-privacidad).
 * Inicio de sesión simulado: sin contraseñas ni verificación externa (ADR-003).
 */

export const DOC_TYPES: readonly DocType[] = ['CC', 'NIT']

/** Mensajes de validación, listos para mostrarse junto a cada campo. */
export const PROFILE_ERRORS = {
  name: 'Escribe tu nombre o el de tu empresa.',
  docType: 'Elige si es cédula (CC) o NIT.',
  docNumber: 'Escribe el número de cédula o NIT, solo con números (puede llevar puntos o guion).',
  acceptsDataTreatment:
    'Para crear el perfil debes autorizar el tratamiento de tus datos personales (Ley 1581 de 2012).',
} as const

export type ProfileErrors = Partial<Record<keyof NewProfileInput, string>>

export interface ValidationResult<E> {
  ok: boolean
  errors: E
}

/** Cédula o NIT: dígitos, con puntos, espacios o guion opcionales (ej. "900.123.456-7"). */
const DOC_NUMBER_PATTERN = /^\d[\d. -]*$/

/** La autorización de tratamiento de datos es obligatoria antes de crear un perfil. */
export function hasDataTreatmentConsent(input: Pick<NewProfileInput, 'acceptsDataTreatment'>): boolean {
  return input.acceptsDataTreatment === true
}

/** Valida los datos de un perfil nuevo. No crea nada: la UI y el repositorio reutilizan esta regla. */
export function validateNewProfile(input: NewProfileInput): ValidationResult<ProfileErrors> {
  const errors: ProfileErrors = {}
  if (!input.name.trim()) errors.name = PROFILE_ERRORS.name
  if (!DOC_TYPES.includes(input.docType)) errors.docType = PROFILE_ERRORS.docType
  if (!DOC_NUMBER_PATTERN.test(input.docNumber.trim())) errors.docNumber = PROFILE_ERRORS.docNumber
  if (!hasDataTreatmentConsent(input)) errors.acceptsDataTreatment = PROFILE_ERRORS.acceptsDataTreatment
  return { ok: Object.keys(errors).length === 0, errors }
}

/** Solo el rol coordinador abre el panel de coordinación y restablece los datos de demostración. */
export function canCoordinate(profile: Pick<Profile, 'role'> | null | undefined): boolean {
  return profile?.role === 'coordinador'
}

/** Rol de quien tiene la sesión, o `null` si nadie ha ingresado. */
export function roleOf(profile: Pick<Profile, 'role'> | null | undefined): Role | null {
  return profile?.role ?? null
}

import type { ValidationResult } from './profile'
import { MUNICIPIOS, NEED_TYPES, REQUESTER_PROFILES, VULNERABILITIES } from './types'
import type { NewNeedInput } from './types'

/** Mensajes de validación del formulario "Pedir ayuda", listos para mostrarse junto a cada campo. */
export const NEED_ERRORS = {
  requester: 'Elige si eres comerciante o familia.',
  type: 'Elige qué tipo de ayuda necesitas.',
  items: 'Agrega al menos un ítem con su cantidad (mayor que cero).',
  peopleAffected: 'Escribe cuántas personas están afectadas (mínimo 1).',
  vulnerabilities: 'Elige solo opciones de la lista.',
  municipio: 'Elige tu municipio.',
  barrio: 'Escribe tu barrio o vereda.',
} as const

export type NeedFormErrors = Partial<Record<keyof NewNeedInput, string>>

/** Error con los errores por campo; lo lanza el repositorio al recibir datos inválidos. */
export class NeedValidationError extends Error {
  readonly errors: NeedFormErrors
  constructor(errors: NeedFormErrors) {
    super(Object.values(errors)[0] ?? 'Revisa los datos de la necesidad.')
    this.name = 'NeedValidationError'
    this.errors = errors
  }
}

const isPositiveInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0

/** Valida el formulario. Acepta datos parciales porque el formulario puede enviarse con campos vacíos. */
export function validateNewNeed(input: Partial<NewNeedInput>): ValidationResult<NeedFormErrors> {
  const errors: NeedFormErrors = {}
  if (!input.requester || !REQUESTER_PROFILES.includes(input.requester)) errors.requester = NEED_ERRORS.requester
  if (!input.type || !NEED_TYPES.includes(input.type)) errors.type = NEED_ERRORS.type
  const items = input.items ?? []
  if (items.length === 0 || items.some((i) => !i.label?.trim() || !isPositiveInt(i.requested))) {
    errors.items = NEED_ERRORS.items
  }
  if (!isPositiveInt(input.peopleAffected)) errors.peopleAffected = NEED_ERRORS.peopleAffected
  if ((input.vulnerabilities ?? []).some((v) => !VULNERABILITIES.includes(v))) {
    errors.vulnerabilities = NEED_ERRORS.vulnerabilities
  }
  if (!input.municipio || !MUNICIPIOS.includes(input.municipio)) errors.municipio = NEED_ERRORS.municipio
  if (!input.barrio?.trim()) errors.barrio = NEED_ERRORS.barrio
  return { ok: Object.keys(errors).length === 0, errors }
}

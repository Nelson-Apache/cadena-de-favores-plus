import { useState } from 'react'
import { repository } from '@/data'
import { NeedValidationError, validateNewNeed, type NeedFormErrors } from '@/domain/needForm'
import type { Municipio, NeedType, NewNeedInput, RequesterProfile, Vulnerability } from '@/domain/types'

export interface ItemDraft {
  label: string
  unit: string
  /** Texto del campo: se convierte a número al validar. */
  quantity: string
}

export interface HelpFormValues {
  requester: RequesterProfile | ''
  type: NeedType | ''
  items: ItemDraft[]
  peopleAffected: number
  vulnerabilities: Vulnerability[]
  municipio: Municipio | ''
  barrio: string
}

export const EMPTY_ITEM: ItemDraft = { label: '', unit: '', quantity: '' }

const initialValues = (requester: RequesterProfile | ''): HelpFormValues => ({
  requester,
  type: '',
  items: [{ ...EMPTY_ITEM }],
  peopleAffected: 1,
  vulnerabilities: [],
  municipio: '',
  barrio: '',
})

/** Convierte lo escrito en el formulario al dato que valida y guarda el dominio. */
function toInput(v: HelpFormValues): Partial<NewNeedInput> {
  return {
    requester: v.requester || undefined,
    type: v.type || undefined,
    items: v.items.map((i) => ({
      label: i.label.trim(),
      unit: i.unit.trim() || 'unidades',
      requested: Number(i.quantity),
    })),
    peopleAffected: v.peopleAffected,
    vulnerabilities: v.vulnerabilities,
    municipio: v.municipio || undefined,
    barrio: v.barrio,
  }
}

/**
 * Estado del formulario "Pedir ayuda". Valida con `validateNewNeed`: los errores aparecen tras el primer intento
 * y se actualizan mientras la persona corrige. Publica con `repository.createNeed`.
 */
export function useRequestHelpForm(initialRequester: RequesterProfile | '', ownerId: string | undefined) {
  const [values, setValues] = useState<HelpFormValues>(() => initialValues(initialRequester))
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<NeedFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)

  const liveErrors: NeedFormErrors = submitted ? validateNewNeed(toInput(values)).errors : {}
  const errors: NeedFormErrors = { ...serverErrors, ...liveErrors }

  const setField = <K extends keyof HelpFormValues>(field: K, value: HelpFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setServerErrors({})
  }
  const setItem = (index: number, patch: Partial<ItemDraft>) =>
    setField(
      'items',
      values.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    )
  const addItem = () => setField('items', [...values.items, { ...EMPTY_ITEM }])
  const removeItem = (index: number) =>
    setField(
      'items',
      values.items.filter((_, i) => i !== index),
    )
  const toggleVulnerability = (v: Vulnerability) =>
    setField(
      'vulnerabilities',
      values.vulnerabilities.includes(v)
        ? values.vulnerabilities.filter((x) => x !== v)
        : [...values.vulnerabilities, v],
    )

  /** Publica la necesidad. Devuelve el id de la necesidad creada, o `null` si hay errores (ya visibles). */
  const submit = async (): Promise<string | null> => {
    setSubmitted(true)
    setFormError(null)
    const input = toInput(values)
    if (!validateNewNeed(input).ok) return null
    if (!ownerId) {
      setFormError('Ingresa a tu perfil para publicar una necesidad.')
      return null
    }
    setPublishing(true)
    try {
      const need = await repository.createNeed(input as NewNeedInput, ownerId)
      return need.id
    } catch (e) {
      if (e instanceof NeedValidationError) setServerErrors(e.errors)
      else setFormError(e instanceof Error ? e.message : 'No pudimos publicar tu necesidad. Intenta de nuevo.')
      return null
    } finally {
      setPublishing(false)
    }
  }

  return { values, errors, formError, publishing, setField, setItem, addItem, removeItem, toggleVulnerability, submit }
}

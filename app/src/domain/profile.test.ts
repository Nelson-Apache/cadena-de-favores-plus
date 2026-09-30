import { canCoordinate, PROFILE_ERRORS, roleOf, validateNewProfile } from './profile'
import type { NewProfileInput } from './types'

const valid: NewProfileInput = {
  name: 'Tienda La Esquina',
  docType: 'CC',
  docNumber: '1.094.000.123',
  acceptsDataTreatment: true,
}

describe('validateNewProfile', () => {
  it('acepta un perfil completo con autorización', () => {
    expect(validateNewProfile(valid)).toEqual({ ok: true, errors: {} })
    expect(validateNewProfile({ ...valid, docType: 'NIT', docNumber: '900123456-7' }).ok).toBe(true)
  })
  it('sin la autorización de tratamiento de datos no se crea el perfil', () => {
    const res = validateNewProfile({ ...valid, acceptsDataTreatment: false })
    expect(res.ok).toBe(false)
    expect(res.errors.acceptsDataTreatment).toBe(PROFILE_ERRORS.acceptsDataTreatment)
    expect(res.errors.acceptsDataTreatment).toMatch(/obligatori|debes autorizar/i)
  })
  it('pide nombre y número de documento', () => {
    const res = validateNewProfile({ ...valid, name: '   ', docNumber: '' })
    expect(res.ok).toBe(false)
    expect(res.errors.name).toBe(PROFILE_ERRORS.name)
    expect(res.errors.docNumber).toBe(PROFILE_ERRORS.docNumber)
  })
  it('rechaza documentos con letras', () => {
    expect(validateNewProfile({ ...valid, docNumber: 'abc123' }).errors.docNumber).toBeDefined()
  })
})

describe('Roles', () => {
  it('Usuario sin rol coordinador: un perfil con rol usuario no tiene acceso a coordinación ni a restablecer', () => {
    expect(canCoordinate({ role: 'usuario' })).toBe(false)
  })
  it('un perfil con rol coordinador sí tiene acceso a coordinación y a restablecer', () => {
    expect(canCoordinate({ role: 'coordinador' })).toBe(true)
  })
})

describe('Tratamiento de datos (Ley 1581 de 2012)', () => {
  it('Crear perfil: sin la autorización la validación falla solo por la autorización', () => {
    expect(validateNewProfile({ ...valid, acceptsDataTreatment: false }).errors).toEqual({
      acceptsDataTreatment: PROFILE_ERRORS.acceptsDataTreatment,
    })
  })
})

describe('roles', () => {
  it('solo el coordinador puede coordinar', () => {
    expect(canCoordinate({ role: 'coordinador' })).toBe(true)
    expect(canCoordinate({ role: 'usuario' })).toBe(false)
    expect(canCoordinate(null)).toBe(false)
  })
  it('roleOf devuelve null sin sesión', () => {
    expect(roleOf(undefined)).toBeNull()
    expect(roleOf({ role: 'usuario' })).toBe('usuario')
  })
})

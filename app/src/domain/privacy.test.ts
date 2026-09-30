import { canViewContact, roundCoordinates } from './privacy'
import type { HousingRequest } from './types'

const request = (status: HousingRequest['status']) => ({ status, requesterId: 'familia', ownerId: 'duena' })

describe('canViewContact', () => {
  it('las dos partes de una solicitud aceptada ven el contacto', () => {
    expect(canViewContact(request('aceptada'), 'familia')).toBe(true)
    expect(canViewContact(request('aceptada'), 'duena')).toBe(true)
  })
  it('ningún otro perfil lo ve, ni siquiera el coordinador', () => {
    expect(canViewContact(request('aceptada'), 'coordinador')).toBe(false)
  })
  it('sin sesión no se ve', () => {
    expect(canViewContact(request('aceptada'), null)).toBe(false)
    expect(canViewContact(request('aceptada'), undefined)).toBe(false)
    expect(canViewContact(request('aceptada'), '')).toBe(false)
  })
  it('si la solicitud está pendiente o rechazada no se comparte', () => {
    expect(canViewContact(request('pendiente'), 'familia')).toBe(false)
    expect(canViewContact(request('rechazada'), 'duena')).toBe(false)
  })
})

describe('roundCoordinates', () => {
  it('redondea a 3 decimales y conserva los demás campos', () => {
    const loc = { municipio: 'Quimbaya' as const, barrio: 'Centro', lat: 4.623456, lng: -75.762649 }
    expect(roundCoordinates(loc)).toEqual({ municipio: 'Quimbaya', barrio: 'Centro', lat: 4.623, lng: -75.763 })
  })
  it('no modifica el objeto original', () => {
    const loc = { lat: 4.12345, lng: -75.12345 }
    roundCoordinates(loc)
    expect(loc).toEqual({ lat: 4.12345, lng: -75.12345 })
  })
  it('es idempotente', () => {
    const once = roundCoordinates({ lat: 4.5339, lng: -75.6811 })
    expect(roundCoordinates(once)).toEqual(once)
  })
})

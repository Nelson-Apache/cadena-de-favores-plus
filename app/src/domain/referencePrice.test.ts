import { percentBelow, referencePrice, sealFor } from './referencePrice'
import type { HousingOffer, Municipio } from './types'

let seq = 0
const offer = (
  municipio: Municipio,
  barrio: string,
  price: number,
  type: HousingOffer['offerType'] = 'arriendo_normal',
): HousingOffer => ({
  id: `h${seq++}`,
  title: 'x',
  offerType: type,
  monthlyPrice: price,
  capacity: { people: 4, kids: true, elderly: true, pets: false },
  availability: '3_meses',
  habitability: 'si',
  ownerId: 'u',
  location: { municipio, barrio, lat: 0, lng: 0 },
})

const market = [
  offer('Calarcá', 'Las Américas', 600_000),
  offer('Calarcá', 'Las Américas', 620_000),
  offer('Calarcá', 'Las Américas', 640_000),
  offer('Calarcá', 'Centro', 700_000),
  offer('Armenia', 'Granada', 900_000),
]

describe('precio de referencia', () => {
  it('usa el barrio cuando hay al menos 3 arriendos', () => {
    expect(referencePrice(market, 'Calarcá', 'Las Américas')).toEqual({ value: 620_000, scope: 'barrio', sample: 3 })
  })
  it('cae al municipio si el barrio no tiene suficientes datos', () => {
    const ref = referencePrice(market, 'Calarcá', 'Centro')
    expect(ref?.scope).toBe('municipio')
    expect(ref?.value).toBe(640_000)
  })
  it('devuelve null sin datos suficientes', () => {
    expect(referencePrice(market, 'Armenia', 'Granada')).toBeNull()
  })
  it('ignora ofertas gratis y solidarias al calcular', () => {
    const withSolidarias = [...market, offer('Calarcá', 'Las Américas', 100_000, 'arriendo_solidario')]
    expect(referencePrice(withSolidarias, 'Calarcá', 'Las Américas')?.value).toBe(620_000)
  })
})

describe('sello', () => {
  const ref = { value: 620_000, scope: 'barrio' as const, sample: 3 }
  it('otorga "arriendo solidario" por debajo de la referencia', () => {
    expect(sealFor({ offerType: 'arriendo_solidario', monthlyPrice: 450_000 }, ref)).toBe('arriendo_solidario')
    expect(percentBelow(450_000, ref)).toBe(27)
  })
  it('no otorga sello si iguala o supera la referencia', () => {
    expect(sealFor({ offerType: 'arriendo_normal', monthlyPrice: 620_000 }, ref)).toBeNull()
  })
  it('las ofertas gratis llevan "alojamiento solidario"', () => {
    expect(sealFor({ offerType: 'gratis', monthlyPrice: 0 }, null)).toBe('alojamiento_solidario')
  })
})

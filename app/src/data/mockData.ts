import { roundCoordinates } from '@/domain/privacy'
import type {
  DemoProfile,
  HousingOffer,
  HousingRequest,
  Commitment,
  Municipio,
  Need,
  PrivateAddress,
  PrivateContact,
  Resource,
} from '@/domain/types'

/**
 * Datos de demostración (semilla) para desarrollo, demos y pruebas con usuarios.
 * Reproducen el problema del Design Thinking: la ayuda se amontona en Armenia (verde)
 * mientras Quimbaya queda sin ayuda (rojo).
 * Las coordenadas son aproximadas al barrio, nunca la dirección exacta.
 */

export const MUNICIPIO_CENTER: Record<Municipio, [number, number]> = {
  Armenia: [4.5339, -75.6811],
  Buenavista: [4.3597, -75.7389],
  Calarcá: [4.5297, -75.6436],
  Circasia: [4.619, -75.636],
  Córdoba: [4.3914, -75.6875],
  Filandia: [4.6745, -75.6583],
  Génova: [4.2069, -75.79],
  'La Tebaida': [4.4526, -75.7876],
  Montenegro: [4.5664, -75.7508],
  Pijao: [4.3337, -75.7045],
  Quimbaya: [4.6232, -75.7626],
  Salento: [4.6378, -75.5708],
}

const now = Date.now()
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString()
/** Ubicación pública aproximada: coordenadas redondeadas a 3 decimales (spec: cuentas-y-privacidad). */
const at = (m: Municipio, barrio: string, dLat = 0, dLng = 0) =>
  roundCoordinates({
    municipio: m,
    barrio,
    lat: MUNICIPIO_CENTER[m][0] + dLat,
    lng: MUNICIPIO_CENTER[m][1] + dLng,
  })

export const needs: Need[] = [
  // Quimbaya: se está quedando atrás
  {
    id: 'n-482',
    ownerId: 'u-familia',
    title: 'Carpas y agua para 5 familias',
    type: 'carpas',
    requester: 'familia',
    peopleAffected: 18,
    vulnerabilities: ['ninos', 'adultos_mayores'],
    createdAt: daysAgo(3),
    location: at('Quimbaya', 'La Española', 0.004, -0.003),
    items: [
      { label: 'Carpas', unit: 'carpas', requested: 5, committed: 2, delivered: 0 },
      { label: 'Agua potable', unit: 'litros', requested: 100, committed: 40, delivered: 0 },
      { label: 'Colchonetas', unit: 'colchonetas', requested: 10, committed: 0, delivered: 0 },
    ],
  },
  {
    id: 'n-483',
    title: 'Techo temporal para familia con adulto mayor',
    type: 'techo',
    requester: 'familia',
    peopleAffected: 4,
    vulnerabilities: ['adultos_mayores'],
    createdAt: daysAgo(4),
    location: at('Quimbaya', 'Centro', -0.002, 0.004),
    items: [{ label: 'Alojamiento', unit: 'meses', requested: 3, committed: 0, delivered: 0 }],
  },
  {
    id: 'n-484',
    title: 'Mercados para comedor comunitario',
    type: 'alimento',
    requester: 'familia',
    peopleAffected: 40,
    vulnerabilities: ['ninos'],
    createdAt: daysAgo(2),
    location: at('Quimbaya', 'El Jardín', 0.006, 0.006),
    items: [{ label: 'Mercados', unit: 'mercados', requested: 40, committed: 0, delivered: 0 }],
  },
  {
    id: 'n-485',
    title: 'Bodega para salvar inventario de ferretería',
    type: 'bodega',
    requester: 'comerciante',
    peopleAffected: 6,
    vulnerabilities: [],
    createdAt: daysAgo(3),
    location: at('Quimbaya', 'Obrero', -0.005, -0.005),
    items: [{ label: 'Bodega', unit: 'm²', requested: 80, committed: 0, delivered: 0 }],
  },
  {
    id: 'n-486',
    title: 'Agua potable para vereda',
    type: 'agua',
    requester: 'familia',
    peopleAffected: 25,
    vulnerabilities: ['ninos', 'enfermos'],
    createdAt: daysAgo(5),
    location: at('Quimbaya', 'Vereda El Laurel', 0.012, -0.01),
    items: [{ label: 'Agua potable', unit: 'litros', requested: 500, committed: 0, delivered: 0 }],
  },
  // Montenegro / Circasia: en camino
  {
    id: 'n-490',
    title: 'Transporte de mercancía a bodega temporal',
    type: 'transporte',
    requester: 'comerciante',
    peopleAffected: 5,
    vulnerabilities: [],
    createdAt: daysAgo(1),
    location: at('Montenegro', 'Centro', 0.002, 0.001),
    items: [{ label: 'Viajes de camión', unit: 'viajes', requested: 3, committed: 1, delivered: 0 }],
  },
  {
    id: 'n-491',
    title: 'Reparación de fachada de panadería',
    type: 'reparacion',
    requester: 'comerciante',
    peopleAffected: 8,
    vulnerabilities: [],
    createdAt: daysAgo(2),
    location: at('Circasia', 'La Pola', -0.002, 0.003),
    items: [{ label: 'Horas de mano de obra', unit: 'horas', requested: 40, committed: 16, delivered: 0 }],
  },
  {
    id: 'n-492',
    title: 'Asesoría de seguros para comerciantes',
    type: 'asesoria',
    requester: 'comerciante',
    peopleAffected: 12,
    vulnerabilities: [],
    createdAt: daysAgo(1),
    location: at('La Tebaida', 'Centro'),
    items: [{ label: 'Asesorías', unit: 'asesorías', requested: 12, committed: 4, delivered: 0 }],
  },
  // Armenia: ayuda concentrada
  ...Array.from({ length: 8 }, (_, i): Need => ({
    id: `n-50${i}`,
    title: [
      'Colchonetas para albergue',
      'Kits de aseo',
      'Mercados familiares',
      'Carpas para parque',
      'Agua embotellada',
      'Planta eléctrica para tienda',
      'Ropa de abrigo',
      'Transporte de enseres',
    ][i],
    type: (['carpas', 'salud', 'alimento', 'carpas', 'agua', 'equipos', 'techo', 'transporte'] as const)[i],
    requester: i === 5 ? 'comerciante' : 'familia',
    peopleAffected: 6 + i * 2,
    vulnerabilities: i % 2 ? ['ninos'] : [],
    createdAt: daysAgo(6),
    location: at(
      'Armenia',
      ['Granada', 'La Clarita', 'Centro', 'El Bosque', 'La Patria', 'Centro', 'Uribe', 'Granada'][i],
      (i % 3) * 0.004 - 0.004,
      (i % 4) * 0.003 - 0.005,
    ),
    items: [{ label: 'Unidades', unit: 'unidades', requested: 10, committed: 10, delivered: 10 }],
  })),
  {
    id: 'n-520',
    title: 'Mercados para familias del barrio',
    type: 'alimento',
    requester: 'familia',
    peopleAffected: 15,
    vulnerabilities: ['ninos'],
    createdAt: daysAgo(2),
    location: at('Calarcá', 'Las Américas', -0.003, 0.002),
    items: [{ label: 'Mercados', unit: 'mercados', requested: 15, committed: 15, delivered: 15 }],
  },
]

export const resources: Resource[] = [
  {
    id: 'r-1',
    type: 'bodega',
    title: 'Bodega 200 m²',
    description: 'Bodega seca con acceso para camión.',
    capacity: '200 m²',
    location: at('Calarcá', 'Zona industrial', 0.004, 0.006),
    ownerId: 'u-10',
    confirmedAt: daysAgo(40),
    available: true,
  },
  {
    id: 'r-2',
    type: 'transporte',
    title: 'Camión 3,5 toneladas con conductor',
    description: 'Disponible fines de semana y emergencias.',
    capacity: '3,5 t',
    location: at('Armenia', 'La Castellana', 0.008, 0.01),
    ownerId: 'u-11',
    confirmedAt: daysAgo(20),
    available: true,
  },
  {
    id: 'r-3',
    type: 'planta_electrica',
    title: 'Planta eléctrica 15 kVA',
    description: 'Diésel, con operador.',
    capacity: '15 kVA',
    location: at('Armenia', 'Centro', -0.008, 0.004),
    ownerId: 'u-12',
    confirmedAt: daysAgo(200),
    available: true,
  },
  {
    id: 'r-4',
    type: 'horas_profesionales',
    title: 'Ingeniera civil · 20 horas',
    description: 'Evaluación estructural de locales y viviendas.',
    location: at('Circasia', 'Centro', 0.003, -0.004),
    ownerId: 'u-13',
    confirmedAt: daysAgo(10),
    available: true,
  },
  {
    id: 'r-5',
    type: 'equipos',
    title: 'Herramientas de construcción',
    description: 'Andamios, taladros y escaleras.',
    location: at('Montenegro', 'Pueblo Tapao', -0.006, 0.005),
    ownerId: 'u-14',
    confirmedAt: daysAgo(90),
    available: true,
  },
]

export const housing: HousingOffer[] = [
  {
    id: 'h-1',
    title: 'Habitación amplia con baño privado',
    offerType: 'arriendo_solidario',
    monthlyPrice: 450_000,
    capacity: { people: 4, kids: true, elderly: true, pets: true },
    availability: '3_meses',
    habitability: 'si',
    location: at('Calarcá', 'Las Américas', 0.002, -0.002),
    ownerId: 'u-20',
  },
  {
    id: 'h-2',
    title: 'Apartaestudio independiente',
    offerType: 'arriendo_solidario',
    monthlyPrice: 480_000,
    capacity: { people: 2, kids: false, elderly: true, pets: false },
    availability: '1_mes',
    habitability: 'si',
    location: at('Armenia', 'Granada', 0.01, -0.012),
    ownerId: 'u-21',
  },
  {
    id: 'h-3',
    title: 'Casa campestre compartida',
    offerType: 'gratis',
    monthlyPrice: 0,
    capacity: { people: 4, kids: true, elderly: true, pets: true },
    availability: 'mas',
    habitability: 'en_tramite',
    location: at('Circasia', 'Vereda La Julia', 0.01, 0.01),
    ownerId: 'u-22',
  },
  {
    id: 'h-4',
    title: 'Habitación doble céntrica',
    offerType: 'arriendo_normal',
    monthlyPrice: 600_000,
    capacity: { people: 2, kids: true, elderly: false, pets: false },
    availability: '3_meses',
    habitability: 'si',
    location: at('La Tebaida', 'Centro', 0.003, 0.003),
    ownerId: 'u-23',
  },
  // Arriendos de mercado (base del precio de referencia)
  ...[600_000, 620_000, 640_000].map((p, i): HousingOffer => ({
    id: `h-m${i}`,
    title: 'Apartamento 2 habitaciones',
    offerType: 'arriendo_normal',
    monthlyPrice: p,
    capacity: { people: 4, kids: true, elderly: true, pets: false },
    availability: 'mas',
    habitability: 'si',
    location: at('Calarcá', 'Las Américas', 0.001 * i, 0.002 * i),
    ownerId: `u-3${i}`,
  })),
]

// ---------- Cuentas y privacidad (change add-persistencia-local) ----------

/**
 * Perfiles fijos de demostración para el inicio de sesión simulado (sin contraseñas, ADR-003).
 * Documentos ficticios. "Empresa que ayuda" usa `u-10`, dueña de la bodega `r-1`.
 */
export const demoProfiles: DemoProfile[] = [
  {
    id: 'u-familia',
    label: 'Familia damnificada',
    description: 'Pide ayuda y busca una vivienda solidaria.',
    name: 'Familia Ospina Rojas',
    docType: 'CC',
    docNumber: '1000000001',
    role: 'usuario',
    verified: true,
    demo: true,
    dataTreatmentAcceptedAt: daysAgo(30),
    createdAt: daysAgo(30),
  },
  {
    id: 'u-comerciante',
    label: 'Comerciante afectado',
    description: 'Pide apoyo para recuperar su negocio.',
    name: 'Martha Giraldo',
    docType: 'CC',
    docNumber: '1000000002',
    role: 'usuario',
    verified: true,
    demo: true,
    dataTreatmentAcceptedAt: daysAgo(30),
    createdAt: daysAgo(30),
  },
  {
    id: 'u-10',
    label: 'Empresa que ayuda',
    description: 'Ofrece recursos a la Red lista.',
    name: 'Bodegas del Café S.A.S.',
    docType: 'NIT',
    docNumber: '900000001-1',
    role: 'usuario',
    verified: true,
    demo: true,
    dataTreatmentAcceptedAt: daysAgo(60),
    createdAt: daysAgo(60),
  },
  {
    id: 'u-coordinador',
    label: 'Coordinador',
    description: 'Ve el panel de coordinación y restablece los datos de demostración.',
    name: 'Coordinación Quindío',
    docType: 'CC',
    docNumber: '1000000004',
    role: 'coordinador',
    verified: true,
    demo: true,
    dataTreatmentAcceptedAt: daysAgo(90),
    createdAt: daysAgo(90),
  },
]

/** Solicitudes de vivienda de ejemplo: una aceptada (contacto compartido) y una pendiente. */
export const housingRequests: HousingRequest[] = [
  {
    id: 'hr-1',
    housingId: 'h-1',
    requesterId: 'u-familia',
    ownerId: 'u-20',
    status: 'aceptada',
    createdAt: daysAgo(2),
  },
  {
    id: 'hr-2',
    housingId: 'h-3',
    requesterId: 'u-familia',
    ownerId: 'u-22',
    status: 'pendiente',
    createdAt: daysAgo(1),
  },
]

/** PRIVADO: teléfonos ficticios. Solo se entregan con `getContactFor` a las partes de una solicitud aceptada. */
export const privateContacts: PrivateContact[] = [
  { profileId: 'u-familia', name: 'Familia Ospina Rojas', phone: '300 000 0001' },
  { profileId: 'u-comerciante', name: 'Martha Giraldo', phone: '300 000 0002' },
  { profileId: 'u-10', name: 'Bodegas del Café S.A.S.', phone: '300 000 0003' },
  { profileId: 'u-20', name: 'Luz Marina Arango', phone: '300 000 0020' },
  { profileId: 'u-22', name: 'Jorge Castaño', phone: '300 000 0022' },
]

/** PRIVADO: direcciones exactas ficticias de las viviendas. */
export const privateAddresses: PrivateAddress[] = [
  { housingId: 'h-1', address: 'Calle 40 # 25-10, Las Américas, Calarcá' },
  { housingId: 'h-3', address: 'Vereda La Julia, finca El Recreo, Circasia' },
]

/**
 * Compromisos de demostración coherentes con `committed` y `delivered` de las necesidades sembradas:
 * lo entregado queda confirmado y el resto comprometido, todo a nombre de la empresa de demostración (`u-10`).
 */
export const commitments: Commitment[] = needs.flatMap((need) =>
  need.items.flatMap((item, index): Commitment[] => {
    const base = { needId: need.id, itemLabel: item.label, helperId: 'u-10' }
    const at = daysAgo(1)
    const list: Commitment[] = []
    if (item.delivered > 0) {
      list.push({
        ...base,
        id: `c-${need.id}-${index}-e`,
        quantity: item.delivered,
        status: 'confirmado',
        createdAt: at,
        deliveredAt: at,
        confirmedAt: at,
        confirmedBy: need.ownerId ?? 'u-coordinador',
      })
    }
    if (item.committed > item.delivered) {
      list.push({
        ...base,
        id: `c-${need.id}-${index}-c`,
        quantity: item.committed - item.delivered,
        status: 'comprometido',
        createdAt: at,
      })
    }
    return list
  }),
)

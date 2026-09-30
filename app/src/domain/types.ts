/**
 * Modelo de dominio de Cadena de Favores+.
 * Cada tipo corresponde a una capacidad en openspec/specs/.
 */

export const MUNICIPIOS = [
  'Armenia',
  'Buenavista',
  'Calarcá',
  'Circasia',
  'Córdoba',
  'Filandia',
  'Génova',
  'La Tebaida',
  'Montenegro',
  'Pijao',
  'Quimbaya',
  'Salento',
] as const
export type Municipio = (typeof MUNICIPIOS)[number]

/** Coordenada pública aproximada (nunca la dirección exacta). Spec: cuentas-y-privacidad. */
export interface ApproxLocation {
  municipio: Municipio
  barrio: string
  lat: number
  lng: number
}

// ---------- Red lista (spec: red-lista) ----------
export type ResourceType =
  'bodega' | 'transporte' | 'planta_electrica' | 'equipos' | 'horas_profesionales' | 'mano_de_obra' | 'visibilidad'

export interface Resource {
  id: string
  type: ResourceType
  title: string
  description: string
  capacity?: string
  location: ApproxLocation
  ownerId: string
  /** Fecha de la última confirmación de disponibilidad (ISO). Se pide confirmar cada 6 meses. */
  confirmedAt: string
  available: boolean
}

// ---------- Vivienda solidaria (spec: vivienda-solidaria) ----------
export type HousingOfferType = 'gratis' | 'arriendo_solidario' | 'arriendo_normal'
export type Availability = '1_semana' | '1_mes' | '3_meses' | 'mas'
export type Habitability = 'si' | 'no' | 'en_tramite'

export interface HousingOffer {
  id: string
  title: string
  offerType: HousingOfferType
  /** Precio mensual en COP. 0 si es gratis. */
  monthlyPrice: number
  capacity: { people: number; kids: boolean; elderly: boolean; pets: boolean }
  availability: Availability
  habitability: Habitability
  location: ApproxLocation
  ownerId: string
}

// ---------- Necesidades (spec: necesidades) ----------
export type NeedType =
  | 'techo'
  | 'agua'
  | 'alimento'
  | 'carpas'
  | 'salud'
  | 'transporte'
  | 'bodega'
  | 'reparacion'
  | 'mano_de_obra'
  | 'equipos'
  | 'asesoria'
  | 'visibilidad'

export type Vulnerability = 'ninos' | 'adultos_mayores' | 'discapacidad' | 'enfermos'

export type RequesterProfile = 'comerciante' | 'familia'

export interface NeedItem {
  label: string
  unit: string
  requested: number
  committed: number
  delivered: number
}

export interface Need {
  id: string
  title: string
  type: NeedType
  requester: RequesterProfile
  peopleAffected: number
  vulnerabilities: Vulnerability[]
  items: NeedItem[]
  location: ApproxLocation
  /** Fecha de registro (ISO). */
  createdAt: string
}

/** Estado de la ayuda (color del marcador). Spec: mapa-de-prioridades. */
export type AidStatus = 'sin_ayuda' | 'en_camino' | 'atendida'
export type PriorityLevel = 'alta' | 'media' | 'baja'

// ---------- Cuentas y privacidad (spec: cuentas-y-privacidad) ----------
/** Rol dentro de la plataforma. Solo `coordinador` abre el panel de coordinación y restablece los datos. */
export type Role = 'usuario' | 'coordinador'
/** Tipo de documento: cédula de ciudadanía (personas) o NIT (empresas y comercios). */
export type DocType = 'CC' | 'NIT'

/**
 * Perfil de una persona, comercio o empresa (inicio de sesión simulado, ADR-003).
 * El número de documento es dato personal: no se muestra en vistas públicas.
 */
export interface Profile {
  id: string
  name: string
  docType: DocType
  docNumber: string
  role: Role
  /** Verificación simulada: la cédula/NIT se registra y se marca "verificada (simulada)"; no hay verificación externa. */
  verified: boolean
  /** Perfil fijo de demostración (familia, comerciante, empresa, coordinador) o creado durante la prueba. */
  demo: boolean
  /** Fecha de la autorización de tratamiento de datos (Ley 1581 de 2012), ISO. */
  dataTreatmentAcceptedAt: string
  createdAt: string
}

/** Perfil de demostración con el texto que se muestra al elegirlo en "Ingresar". */
export interface DemoProfile extends Profile {
  /** Ej.: "Comerciante afectado". */
  label: string
  description: string
}

/** Datos para crear un perfil nuevo. */
export interface NewProfileInput {
  name: string
  docType: DocType
  docNumber: string
  /** Casilla de autorización de tratamiento de datos personales (Ley 1581 de 2012). Obligatoria. */
  acceptsDataTreatment: boolean
}

/** Sesión simulada activa. */
export interface Session {
  profile: Profile
  /** Inicio de la sesión (ISO). */
  startedAt: string
}

/** Estado de una solicitud de vivienda. El contacto solo se comparte cuando está `aceptada` por ambas partes. */
export type HousingRequestStatus = 'pendiente' | 'aceptada' | 'rechazada'

/** Solicitud de una vivienda solidaria entre quien la pide y quien la ofrece. */
export interface HousingRequest {
  id: string
  housingId: string
  requesterId: string
  ownerId: string
  status: HousingRequestStatus
  createdAt: string
}

/** PRIVADO: teléfono de un perfil. Nunca forma parte de un tipo público. */
export interface PrivateContact {
  profileId: string
  name: string
  phone: string
}

/** PRIVADO: dirección exacta de una vivienda. Nunca forma parte de un tipo público. */
export interface PrivateAddress {
  housingId: string
  address: string
}

/** Contacto que ve una parte de una solicitud aceptada sobre la otra parte. */
export interface SharedContact {
  profileId: string
  name: string
  phone?: string
  /** Dirección exacta de la vivienda; solo la recibe quien solicitó la vivienda. */
  address?: string
}

import type {
  AidStatus,
  Availability,
  DocType,
  HousingOfferType,
  NeedType,
  PriorityLevel,
  ResourceType,
  Role,
  Vulnerability,
} from '@/domain/types'

export const STATUS_LABEL: Record<AidStatus, string> = {
  sin_ayuda: 'Sin ayuda',
  en_camino: 'Ayuda en camino',
  atendida: 'Atendida',
}
export const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  alta: 'Prioridad alta',
  media: 'Prioridad media',
  baja: 'Prioridad baja',
}
export const NEED_TYPE_LABEL: Record<NeedType, string> = {
  techo: 'Techo',
  agua: 'Agua',
  alimento: 'Alimento',
  carpas: 'Carpas',
  salud: 'Salud',
  transporte: 'Transporte',
  bodega: 'Bodega',
  reparacion: 'Reparación',
  mano_de_obra: 'Mano de obra',
  equipos: 'Equipos',
  asesoria: 'Asesoría',
  visibilidad: 'Visibilidad',
}
export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  bodega: 'Bodega',
  transporte: 'Transporte',
  planta_electrica: 'Planta eléctrica',
  equipos: 'Equipos',
  horas_profesionales: 'Horas profesionales',
  mano_de_obra: 'Mano de obra',
  visibilidad: 'Visibilidad',
}
export const RESOURCE_ICON: Record<ResourceType, string> = {
  bodega: 'warehouse',
  transporte: 'local_shipping',
  planta_electrica: 'bolt',
  equipos: 'construction',
  horas_profesionales: 'engineering',
  mano_de_obra: 'handyman',
  visibilidad: 'campaign',
}
export const OFFER_TYPE_LABEL: Record<HousingOfferType, string> = {
  gratis: 'Gratis · alojamiento solidario',
  arriendo_solidario: 'Arriendo solidario',
  arriendo_normal: 'Arriendo normal',
}
export const AVAILABILITY_LABEL: Record<Availability, string> = {
  '1_semana': '1 semana',
  '1_mes': '1 mes',
  '3_meses': '3 meses',
  mas: 'Más de 3 meses',
}
export const VULNERABILITY_LABEL: Record<Vulnerability, string> = {
  ninos: 'Niños',
  adultos_mayores: 'Adultos mayores',
  discapacidad: 'Personas con discapacidad',
  enfermos: 'Personas enfermas',
}
export const ROLE_LABEL: Record<Role, string> = {
  usuario: 'Usuario',
  coordinador: 'Coordinador',
}
export const DOC_TYPE_LABEL: Record<DocType, string> = {
  CC: 'Cédula (CC)',
  NIT: 'NIT',
}

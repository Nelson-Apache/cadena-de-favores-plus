import type {
  AidStatus,
  CommitmentStatus,
  RequesterProfile,
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
export const NEED_TYPE_ICON: Record<NeedType, string> = {
  techo: 'home',
  agua: 'water_drop',
  alimento: 'nutrition',
  carpas: 'camping',
  salud: 'health',
  transporte: 'local_shipping',
  bodega: 'warehouse',
  reparacion: 'construction',
  mano_de_obra: 'handyman',
  equipos: 'bolt',
  asesoria: 'gavel',
  visibilidad: 'campaign',
}
export const NEED_TYPE_HINT: Record<NeedType, string> = {
  techo: 'Hospedaje temporal o albergue',
  agua: 'Botellones, bidones y filtros',
  alimento: 'Víveres y kits de comida',
  carpas: 'Carpas, plásticos y toldos',
  salud: 'Medicinas y primeros auxilios',
  transporte: 'Vehículos para traslados',
  bodega: 'Espacio seco para guardar enseres',
  reparacion: 'Puntales, tejas y apoyo técnico',
  mano_de_obra: 'Manos para reconstruir',
  equipos: 'Herramientas y maquinaria',
  asesoria: 'Trámites, seguros y reclamaciones',
  visibilidad: 'Difusión para tu negocio',
}
export const REQUESTER_LABEL: Record<RequesterProfile, string> = {
  familia: 'Soy una familia damnificada',
  comerciante: 'Soy comerciante afectado',
}
export const REQUESTER_HINT: Record<RequesterProfile, string> = {
  familia: 'Vivienda, abrigo, enseres o apoyo vital',
  comerciante: 'Recuperar tu local, inventario o bodega',
}
export const REQUESTER_ICON: Record<RequesterProfile, string> = {
  familia: 'family_restroom',
  comerciante: 'storefront',
}
export const COMMITMENT_STATUS_LABEL: Record<CommitmentStatus, string> = {
  comprometido: 'Comprometido',
  entregado: 'Entregado, falta confirmar',
  confirmado: 'Entrega confirmada',
}

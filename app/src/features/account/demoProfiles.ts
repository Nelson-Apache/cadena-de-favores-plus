import { session } from '@/data'

/** Etiqueta del perfil de demostración (p. ej. "Comerciante afectado"), o `undefined` si el perfil es creado. */
export function demoLabelOf(profileId: string): string | undefined {
  return session.listDemoProfiles().find((p) => p.id === profileId)?.label
}

/** Ícono por perfil de demostración; los perfiles creados usan el genérico. */
const DEMO_ICON: Record<string, string> = {
  'u-familia': 'family_restroom',
  'u-comerciante': 'storefront',
  'u-10': 'warehouse',
  'u-coordinador': 'monitoring',
}

export const demoIconOf = (profileId: string): string => DEMO_ICON[profileId] ?? 'person'

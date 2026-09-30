const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('es-CO')

export const formatCOP = (value: number) => cop.format(value)
export const formatNumber = (value: number) => num.format(value)

export function formatWait(days: number): string {
  if (days === 0) return 'Registrada hoy'
  if (days === 1) return 'Hace 1 día'
  return `Hace ${days} días`
}

/** Documento enmascarado para mostrarlo solo a su dueño: deja visibles los últimos 4 dígitos. */
export function maskDocNumber(docNumber: string): string {
  const digits = docNumber.replace(/\D/g, '')
  return `•••• ${digits.slice(-4)}`
}

/** Iniciales (máximo 2) para el avatar de un perfil. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? [words[0][0], words[1][0]] : [words[0]?.[0] ?? '?']
  return letters.join('').toUpperCase()
}

const dateFmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

/** Fecha corta en español: "29 sept 2026". */
export const formatDate = (iso: string) => dateFmt.format(new Date(iso))
/** Fecha y hora corta: "29 sept, 3:45 p. m.". */
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso))

/** Distancia en km con un decimal y coma: "2,8 km". */
export const formatKm = (km: number) => `${km.toFixed(1).replace('.', ',')} km`

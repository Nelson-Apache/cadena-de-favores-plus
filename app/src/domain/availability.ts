/** Red lista: cada recurso debe reconfirmarse cada 6 meses (spec: red-lista). */
export const CONFIRMATION_MONTHS = 6

export function confirmationDue(confirmedAt: string): Date {
  const d = new Date(confirmedAt)
  d.setMonth(d.getMonth() + CONFIRMATION_MONTHS)
  return d
}

export function needsReconfirmation(confirmedAt: string, now: Date = new Date()): boolean {
  return confirmationDue(confirmedAt).getTime() <= now.getTime()
}

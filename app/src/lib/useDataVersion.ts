import { useSyncExternalStore } from 'react'
import { subscribeToData } from '@/data'

/**
 * Número que sube cada vez que cambian los datos guardados (p. ej. al restablecer la demostración).
 * Úsalo como dependencia de `useAsync` para volver a leer del repositorio.
 */
let version = 0
subscribeToData(() => {
  version += 1
})

const getVersion = () => version

export function useDataVersion(): number {
  return useSyncExternalStore(subscribeToData, getVersion)
}

/** Ruta de la pantalla de ingreso. */
export const SIGN_IN_PATH = '/ingresar'
const RETURN_PARAM = 'volver'

/** Enlace a "Ingresar" que devuelve a `path` después de ingresar. */
export function signInHref(path?: string): string {
  const back = safeReturnPath(path)
  return back ? `${SIGN_IN_PATH}?${RETURN_PARAM}=${encodeURIComponent(back)}` : SIGN_IN_PATH
}

/** Lee la ruta de regreso de la URL de "Ingresar". */
export function returnPathFrom(params: URLSearchParams): string | null {
  return safeReturnPath(params.get(RETURN_PARAM))
}

/** Solo rutas internas de la app (evita redirigir a otros sitios o de vuelta a "Ingresar"). */
function safeReturnPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null
  if (path === SIGN_IN_PATH || path.startsWith(`${SIGN_IN_PATH}?`)) return null
  return path
}
